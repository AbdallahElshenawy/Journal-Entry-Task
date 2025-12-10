using System;
using System.Collections.Generic;
using Journal_Entry_Task.Models;
using Microsoft.EntityFrameworkCore;

namespace Journal_Entry_Task.Data;

public partial class FCarePlusContext : DbContext
{
    public FCarePlusContext()
    {
    }

    public FCarePlusContext(DbContextOptions<FCarePlusContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AccountsChart> AccountsCharts { get; set; }

    public virtual DbSet<JournalEntry> JournalEntries { get; set; }

    public virtual DbSet<JournalEntryDetail> JournalEntryDetails { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AccountsChart>(entity =>
        {
            entity.HasKey(e => e.Id)
                .HasName("PK__Accounts__3214EC2748817F42")
                .HasFillFactor(90);

            entity.ToTable("AccountsChart");

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasColumnName("ID");
            entity.Property(e => e.AllowEntry).HasColumnName("Allow_Entry");
            entity.Property(e => e.BranchId).HasColumnName("Branch_ID");
            entity.Property(e => e.ChartLevelDepth).HasColumnName("Chart_Level_Depth");
            entity.Property(e => e.CreationDate)
                .HasColumnType("datetime")
                .HasColumnName("Creation_Date");
            entity.Property(e => e.FkCostCenterTypeId).HasColumnName("FK_Cost_Center_Type_ID");
            entity.Property(e => e.FkTransactionTypeId).HasColumnName("FK_Transaction_Type_ID");
            entity.Property(e => e.FkWorkFieldsId).HasColumnName("FK_Work_Fields_ID");
            entity.Property(e => e.IsActive).HasColumnName("Is_Active");
            entity.Property(e => e.NameAr)
                .HasMaxLength(150)
                .HasColumnName("NameAR");
            entity.Property(e => e.NameEn)
                .HasMaxLength(150)
                .HasColumnName("NameEN");
            entity.Property(e => e.NoOfChilds).HasColumnName("noOfChilds");
            entity.Property(e => e.Number)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.OrgId).HasColumnName("Org_ID");
            entity.Property(e => e.ParentId).HasColumnName("Parent_ID");
            entity.Property(e => e.ParentNumber)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Parent_Number");
            entity.Property(e => e.Status).HasDefaultValue(true);
            entity.Property(e => e.UserId).HasColumnName("User_ID");
        });

        modelBuilder.Entity<JournalEntry>(entity =>
        {
            entity.ToTable("JournalEntry");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.CreationDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.EntryDate).HasColumnType("datetime");
            entity.Property(e => e.EntryDescription).HasMaxLength(500);
        });

        modelBuilder.Entity<JournalEntryDetail>(entity =>
        {
            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.AccountId).HasColumnName("AccountID");
            entity.Property(e => e.Credit).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Debit).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.JournalEntryId).HasColumnName("JournalEntryID");

            entity.HasOne(d => d.Account).WithMany(p => p.JournalEntryDetails)
                .HasForeignKey(d => d.AccountId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_JournalEntryDetails_AccountsChart");

            entity.HasOne(d => d.JournalEntry).WithMany(p => p.JournalEntryDetails)
                .HasForeignKey(d => d.JournalEntryId)
                .HasConstraintName("FK_JournalEntryDetails_JournalEntry");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
