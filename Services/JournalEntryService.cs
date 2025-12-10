using Journal_Entry_Task.Data;
using Journal_Entry_Task.DTOs;
using Journal_Entry_Task.Models;
using Microsoft.EntityFrameworkCore;

namespace Journal_Entry_Task.Services
{
    public class JournalEntryService(FCarePlusContext context) : IJournalEntryService
    {
        public async Task<List<AccountLookupDTO>> GetAccountsAsync()
        {
            var accounts = await context.AccountsCharts
                .Where(a => a.AllowEntry == true)
                .Select(a => new AccountLookupDTO
                {
                    ID = a.Id,
                    FullName = a.Number + " - " + a.NameAr,
                    Number = a.Number
                })
                .ToListAsync();

            return accounts; 
        }

        public async Task<(bool IsSuccess, string Message)> SaveEntryAsync(JournalEntryDTO entry)
        {
            if (string.IsNullOrEmpty(entry.Description) || entry.EntryDate == DateTime.MinValue)
                return (false, "الوصف والتاريخ حقول إلزامية.");

            if (!entry.Details.Any(d => d.Debit > 0 || d.Credit > 0))
                return (false, "يجب إدخال تفاصيل القيد على الأقل مع مبلغ مدين أو دائن.");

            var totalDebit = entry.Details.Sum(d => d.Debit);
            var totalCredit = entry.Details.Sum(d => d.Credit);

            if (totalDebit != totalCredit)
                return (false,"القيد غير متزن. إجمالي المدين يجب أن يساوي إجمالي الدائن.");

            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var header = new JournalEntry
                {
                    EntryDate = entry.EntryDate,
                    EntryDescription = entry.Description,
                    CreationDate = DateTime.Now
                };
                context.JournalEntries.Add(header);
                await context.SaveChangesAsync();

                foreach (var item in entry.Details.Where(d => d.Debit > 0 || d.Credit > 0))
                {
                    var detail = new JournalEntryDetail
                    {
                        JournalEntryId = header.Id,
                        AccountId = item.AccountID,
                        Debit = item.Debit,
                        Credit = item.Credit
                    };
                    context.JournalEntryDetails.Add(detail);
                }
                await context.SaveChangesAsync();

                await transaction.CommitAsync();
                return (true, "تم حفظ القيد بنجاح"); 
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(); 
                return (false,$"خطأ في عملية الحفظ: {ex.Message}");
            }
        }
    }
}