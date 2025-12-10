namespace Journal_Entry_Task.Models;

public partial class JournalEntryDetail
{
    public int Id { get; set; }

    public int JournalEntryId { get; set; }

    public Guid AccountId { get; set; }

    public decimal Debit { get; set; }

    public decimal Credit { get; set; }

    public virtual AccountsChart Account { get; set; } = null!;

    public virtual JournalEntry JournalEntry { get; set; } = null!;
}
