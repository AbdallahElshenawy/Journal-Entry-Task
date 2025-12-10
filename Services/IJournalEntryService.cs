using Journal_Entry_Task.DTOs;

namespace Journal_Entry_Task.Services
{
    public interface IJournalEntryService
    {
        Task<List<AccountLookupDTO>> GetAccountsAsync();

        Task<(bool IsSuccess, string Message)> SaveEntryAsync(JournalEntryDTO entry);
    }
}
