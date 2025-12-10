angular.module('journalApp', []).controller('JournalEntryController', ['$scope', '$http', '$timeout',
    function ($scope, $http, $timeout) {

        $scope.journalEntry = {
            EntryDate: null,
            Description: null,
            MovementType: 'Daily',
            DocumentNo: null,
            ShortName: null,
            isPrinted: true,
            Details: []
        };

        $scope.message = null;
        $scope.isSuccess = false;
        $scope.validationErrors = [];
        $scope.accountsList = [];
        $scope.totalDebit = 0;
        $scope.totalCredit = 0;
        $scope.difference = 0;
        $scope.isLoading = false;

        const draftData = "journalEntryDraft";

        $scope.showMessage = function (message, isSuccess) {
            $scope.message = message;
            $scope.isSuccess = isSuccess;

            if (isSuccess) {
                $timeout(function () {
                    $scope.message = null;
                }, 5000);
            }
        };

        $scope.safeParseFloat = function (value) {
            if (value === null || value === undefined || value === '') {
                return 0;
            }
            const num = parseFloat(value);
            return isNaN(num) ? 0 : num;
        };

        $scope.saveToLocal = function () {
            try {
                const dataToSave = {
                    EntryDate: $scope.journalEntry.EntryDate,
                    Description: $scope.journalEntry.Description,
                    MovementType: $scope.journalEntry.MovementType,
                    DocumentNo: $scope.journalEntry.DocumentNo,
                    ShortName: $scope.journalEntry.ShortName,
                    isPrinted: $scope.journalEntry.isPrinted,
                    Details: $scope.journalEntry.Details.map(d => ({
                        AccountID: d.AccountID,
                        Account: d.Account,
                        Debit: d.Debit,
                        Credit: d.Credit,
                        Statement: d.Statement,
                        Vendor: d.Vendor,
                        selectedAccount: d.selectedAccount
                    }))
                };
                localStorage.setItem(draftData, JSON.stringify(dataToSave));
            } catch (e) {
                console.warn('Local storage save warning:', e.message);
            }
        };

        $scope.loadFromLocal = function () {
            try {
                const data = localStorage.getItem(draftData);
                if (data) {
                    const parsed = JSON.parse(data);

                    $scope.journalEntry.EntryDate = parsed.EntryDate;
                    $scope.journalEntry.Description = parsed.Description;
                    $scope.journalEntry.MovementType = parsed.MovementType || 'Daily';
                    $scope.journalEntry.DocumentNo = parsed.DocumentNo;
                    $scope.journalEntry.ShortName = parsed.ShortName;
                    $scope.journalEntry.isPrinted = parsed.isPrinted || false;

                    $scope.journalEntry.Details = (parsed.Details || []).map(d => ({
                        AccountID: d.AccountID || null,
                        Account: d.Account || { Number: null },
                        Debit: d.Debit || null,
                        Credit: d.Credit || null,
                        Statement: d.Statement || "",
                        Vendor: d.Vendor || "",
                        selectedAccount: d.selectedAccount || "",
                        accountSuggestions: []
                    }));

                    $scope.calculateTotals();
                }
            } catch (e) {
                console.warn('Local storage load warning:', e.message);
                localStorage.removeItem(draftData);
            }
        };

        $scope.clearDraft = function () {
            if (confirm("هل تريد حذف المسودة المحفوظة؟")) {
                localStorage.removeItem(draftData);
                $scope.showMessage("تم حذف المسودة المحفوظة", true);
                $timeout(function () {
                    location.reload();
                }, 1000);
            }
        };

        $scope.calculateTotals = function () {
            let totalDebit = 0;
            let totalCredit = 0;

            angular.forEach($scope.journalEntry.Details, function (detail) {
                totalDebit += $scope.safeParseFloat(detail.Debit);
                totalCredit += $scope.safeParseFloat(detail.Credit);
            });

            $scope.totalDebit = Math.round(totalDebit * 100) / 100;
            $scope.totalCredit = Math.round(totalCredit * 100) / 100;
            $scope.difference = Math.round((totalDebit - totalCredit) * 100) / 100;
        };

        $scope.onDebitChange = function (detail) {
            const value = $scope.safeParseFloat(detail.Debit);

            if (value > 0) {
                detail.Debit = value;
                detail.Credit = null;
            } else {
                detail.Debit = null;
            }

            $scope.calculateTotals();
            $scope.saveToLocal();
        };

        $scope.onCreditChange = function (detail) {
            const value = $scope.safeParseFloat(detail.Credit);

            if (value > 0) {
                detail.Credit = value;
                detail.Debit = null;
            } else {
                detail.Credit = null;
            }

            $scope.calculateTotals();
            $scope.saveToLocal();
        };

        $scope.addRows = function (count) {
            count = count || 5;

            for (let i = 0; i < count; i++) {
                $scope.journalEntry.Details.push({
                    AccountID: null,
                    Account: { Number: null },
                    Debit: null,
                    Credit: null,
                    Statement: "",
                    Vendor: "",
                    selectedAccount: "",
                    accountSuggestions: []
                });
            }

            $scope.saveToLocal();
        };

        $scope.deleteRow = function (index) {
            const row = $scope.journalEntry.Details[index];

            const hasData = (row.Debit && $scope.safeParseFloat(row.Debit) > 0) ||
                (row.Credit && $scope.safeParseFloat(row.Credit) > 0) ||
                (row.Statement && row.Statement.trim() !== '') ||
                (row.Vendor && row.Vendor.trim() !== '') ||
                row.AccountID;

            if (hasData) {
                if (!confirm("هل تريد حذف هذا السطر الذي يحتوي على بيانات؟")) {
                    return;
                }
            }

            $scope.journalEntry.Details.splice(index, 1);
            $scope.calculateTotals();
            $scope.saveToLocal();
        };

        $scope.getAccountProp = function (account, propName) {
            return account[propName] || account[propName.charAt(0).toLowerCase() + propName.slice(1)] || account[propName.toLowerCase()] || '';
        };

        $scope.getAccountDisplayLabel = function (account) {
            let name = account.fullName || '';

            if (name) {
                return name;
            }
            return name || number || 'حساب غير مسمى';
        };

        $scope.searchAccount = function (detail) {
            if (!$scope.accountsList || $scope.accountsList.length === 0) {
                detail.accountSuggestions = [];
                return;
            }

            if (!detail.selectedAccount || detail.selectedAccount.trim().length < 2) {
                detail.accountSuggestions = [];
                return;
            }

            const keyword = detail.selectedAccount.toLowerCase().trim();

            $timeout(function () {
                try {
                    const filteredAccounts = $scope.accountsList.filter(function (account) {
                        const number = $scope.getAccountProp(account, 'Number');
                        const fullName = $scope.getAccountProp(account, 'FullName');
                        const nameAr = $scope.getAccountProp(account, 'NameAr');
                        const nameEn = $scope.getAccountProp(account, 'NameEn');

                        const searchText = (number + ' ' + fullName + ' ' + nameAr + ' ' + nameEn).toLowerCase();

                        return searchText.includes(keyword);
                    });

                    detail.accountSuggestions = filteredAccounts.map(function (account) {
                        const suggestion = Object.assign({}, account);
                        suggestion.displayLabel = $scope.getAccountDisplayLabel(account);
                        return suggestion;
                    }).slice(0, 8);

                } catch (e) {
                    detail.accountSuggestions = [];
                }
            }, 100);
        };

        $scope.selectAccount = function (detail, account) {

            try {
                detail.AccountID = $scope.getAccountProp(account, 'ID') || $scope.getAccountProp(account, 'Id');

                detail.Account = {
                    Number: $scope.getAccountProp(account, 'Number')
                };

                detail.selectedAccount = account.displayLabel || $scope.getAccountDisplayLabel(account);

                detail.accountSuggestions = [];

                $scope.saveToLocal();
            } catch (e) {
                $scope.showMessage(" حدث خطأ في اختيار الحساب", false);
            }
        };

        $scope.clearAccountSearch = function (detail) {
            $timeout(function () {
                detail.accountSuggestions = [];
            }, 200);
        };


        $scope.validateAndSave = function () {
            if ($scope.isLoading) return;

            $scope.validationErrors = [];

            if (!$scope.journalEntry.EntryDate) {
                $scope.validationErrors.push(" حقل التاريخ إلزامي");
            }

            if (!$scope.journalEntry.Description || $scope.journalEntry.Description.trim() === '') {
                $scope.validationErrors.push(" حقل الوصف إلزامي");
            }

            if (Math.abs($scope.difference) > 0.01) {
                $scope.validationErrors.push(` القيد غير متزن (الفرق = ${$scope.difference.toFixed(2)})`);
            }

            let validLineCount = 0;
            $scope.journalEntry.Details.forEach((detail, index) => {
                const debit = $scope.safeParseFloat(detail.Debit);
                const credit = $scope.safeParseFloat(detail.Credit);

                if (debit > 0 || credit > 0) {
                    validLineCount++;

                    if (!detail.AccountID) {
                        $scope.validationErrors.push(` السطر ${index + 1}: يجب اختيار حساب`);
                    }
                }
            });

            if (validLineCount === 0) {
                $scope.validationErrors.push(" يجب إدخال سطر واحد على الأقل يحتوي على مبلغ");
            }

            if ($scope.validationErrors.length > 0) {
                $scope.showMessage($scope.validationErrors.join('\n'), false);
                return;
            }

            $scope.saveJournalEntry();
        };

        $scope.canSave = function () {
            if (!$scope.journalEntry.EntryDate) {
                return false;
            }
            if (!$scope.journalEntry.Description || $scope.journalEntry.Description.trim() === '') {
                return false;
            }
            if (Math.abs($scope.difference) > 0.01) {
                return false;
            }
            let hasValidRow = false;
            for (let i = 0; i < $scope.journalEntry.Details.length; i++) {
                const detail = $scope.journalEntry.Details[i];
                const debit = $scope.safeParseFloat(detail.Debit);
                const credit = $scope.safeParseFloat(detail.Credit);

                if (debit > 0 || credit > 0) {
                    if (!detail.AccountID) {
                        return false; 
                    }
                    hasValidRow = true;
                }
            }

            if (!hasValidRow) {
                return false;
            }
            if ($scope.isLoading) {
                return false;
            }

            return true;
        };



        $scope.saveJournalEntry = function () {
            $scope.isLoading = true;
            $scope.showMessage("جاري حفظ القيد...", true);

            const dataToSend = {
                EntryDate: $scope.journalEntry.EntryDate,
                Description: $scope.journalEntry.Description,
                MovementType: $scope.journalEntry.MovementType,
                DocumentNo: $scope.journalEntry.DocumentNo,
                ShortName: $scope.journalEntry.ShortName,
                isPrinted: $scope.journalEntry.isPrinted,
                Details: []
            };

            $scope.journalEntry.Details.forEach(detail => {
                const debit = $scope.safeParseFloat(detail.Debit);
                const credit = $scope.safeParseFloat(detail.Credit);

                if (debit > 0 || credit > 0) {
                    dataToSend.Details.push({
                        AccountID: detail.AccountID,
                        Debit: debit,
                        Credit: credit
                    });
                }
            });

            $http({
                method: 'POST',
                url: 'https://localhost:7088/api/JournalEntry/SaveEntry',
                data: dataToSend,
                timeout: 30000 
            })
                .then(function (response) {

                    if (response.data && typeof response.data === 'string' &&
                        response.data.includes('تم حفظ القيد بنجاح')) {

                        $scope.showMessage(response.data, true);

                        localStorage.removeItem(draftData);

                        $timeout(function () {
                            $scope.journalEntry = {
                                EntryDate: null,
                                Description: null,
                                MovementType: 'Daily',
                                DocumentNo: null,
                                ShortName: null,
                                isPrinted: false,
                                Details: []
                            };

                            $scope.totalDebit = 0;
                            $scope.totalCredit = 0;
                            $scope.difference = 0;

                            $scope.addRows(5);

                            $scope.isLoading = false;
                        }, 2000);


                    } 
                })
                .catch(function (error) {
                    let errorMsg = " فشل في حفظ القيد: ";

                    if (error.status === 0) {
                        errorMsg += "تعذر الاتصال بالخادم";
                    } else if (error.status === 400) {
                        errorMsg += error.data || "بيانات غير صالحة";
                    } else if (error.status === 500) {
                        errorMsg += "خطأ داخلي في الخادم";
                    } else if (error.data && error.data.Message) {
                        errorMsg += error.data.Message;
                    } else if (error.data && typeof error.data === 'string') {
                        errorMsg += error.data;
                    } else {
                        errorMsg += "حدث خطأ غير معروف";
                    }

                    $scope.showMessage(errorMsg, false);
                    $scope.isLoading = false;
                });
        };

        $scope.loadAccounts = function () {
            $http({
                method: 'GET',
                url: 'https://localhost:7088/api/JournalEntry/GetAccounts',
                timeout: 15000
            })
                .then(function (response) {
                    if (Array.isArray(response.data)) {
                        $scope.accountsList = response.data;
                        console.log('Successfully loaded', $scope.accountsList.length, 'accounts');
                    } else {
                        console.warn('Unexpected accounts format:', response.data);
                        $scope.accountsList = [];
                    }
                })
                .catch(function (error) {
                    console.error('Failed to load accounts:', error);
                    $scope.accountsList = [];

                });
        };

        $scope.init = function () {
         
            $scope.loadAccounts();

            $scope.loadFromLocal();

            if (!$scope.journalEntry.Details || $scope.journalEntry.Details.length === 0) {
                $scope.addRows(5);
            }

            $scope.calculateTotals();

            const fieldsToWatch = ['EntryDate', 'Description', 'MovementType', 'DocumentNo', 'ShortName'];

            fieldsToWatch.forEach(function (field) {
                $scope.$watch('journalEntry.' + field, function (newVal, oldVal) {
                    if (newVal !== oldVal) {
                        $scope.saveToLocal();
                    }
                });
            });

        $scope.$watch('journalEntry.Details', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.calculateTotals();
            }
        }, true);
    };

        $scope.init();
    }]);