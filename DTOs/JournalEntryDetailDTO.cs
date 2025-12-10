namespace Journal_Entry_Task.DTOs
{
    public class JournalEntryDetailDTO
    {
        public Guid AccountID { get; set; } 
        public decimal Debit { get; set; }
        public decimal Credit { get; set; }
    }
}
