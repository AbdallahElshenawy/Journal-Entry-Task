namespace Journal_Entry_Task.DTOs
{
    public class JournalEntryDTO
    {
        public DateTime EntryDate { get; set; }
        public string Description { get; set; }
        public List<JournalEntryDetailDTO> Details { get; set; }

    }
}
