use fCarePlus;

-- JournalEntry 

    CREATE TABLE [dbo].[JournalEntry] (
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        
        [EntryDate] DATETIME NOT NULL,
        
        [EntryDescription] NVARCHAR(MAX) NOT NULL, 
        
        [CreationDate] DATETIME NULL DEFAULT GETDATE()
    );

GO


--  JournalEntryDetail 

    CREATE TABLE [dbo].[JournalEntryDetail] (
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        
        [JournalEntryId] INT NOT NULL,
        
        [AccountId] UNIQUEIDENTIFIER NOT NULL,
        
        [Debit] DECIMAL(18, 2) NOT NULL DEFAULT 0, 
        
        [Credit] DECIMAL(18, 2) NOT NULL DEFAULT 0,
        
        
        CONSTRAINT [FK_JournalEntryDetail_JournalEntry] FOREIGN KEY ([JournalEntryId]) 
            REFERENCES [dbo].[JournalEntry] ([Id]) 
            ON DELETE CASCADE,
            
        CONSTRAINT [FK_JournalEntryDetail_AccountsChart] FOREIGN KEY ([AccountId]) 
            REFERENCES [dbo].[AccountsChart] ([ID])
    );

GO