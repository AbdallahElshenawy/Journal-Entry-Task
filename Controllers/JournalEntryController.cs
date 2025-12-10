using Journal_Entry_Task.DTOs;
using Journal_Entry_Task.Services;
using Microsoft.AspNetCore.Mvc;

namespace Journal_Entry_Task.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JournalEntryController(IJournalEntryService journalService) : ControllerBase
    {
        [HttpGet("GetAccounts")]
        public async Task<ActionResult> GetAccounts()
        {
            try
            {
                var accounts = await journalService.GetAccountsAsync();
                return Ok(accounts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "خطأ داخلي في الخادم.", Details = ex.Message });
            }
        }

        [HttpPost("SaveEntry")]
        public async Task<ActionResult> SaveEntry([FromBody] JournalEntryDTO entry)
        {
            try
            {
                var result = await journalService.SaveEntryAsync(entry);

                if (result.IsSuccess)
                    return Ok(result.Message);
                else
                    return BadRequest(result.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "خطأ داخلي في الخادم.", Details = ex.Message });
            }
        }
    }
}