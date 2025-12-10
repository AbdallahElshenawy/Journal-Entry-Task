namespace Journal_Entry_Task.Models;

public partial class JournalEntry
{
    public int Id { get; set; }

    public DateTime EntryDate { get; set; }

    public string EntryDescription { get; set; } = null!;

    public DateTime? CreationDate { get; set; }

    public virtual ICollection<JournalEntryDetail> JournalEntryDetails { get; set; } = new List<JournalEntryDetail>();
}
