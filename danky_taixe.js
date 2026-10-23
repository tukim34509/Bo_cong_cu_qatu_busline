    let currentCaptchaCode = "";

        // Hàm tạo mã CAPTCHA ngẫu nhiên
        function generateCaptcha() {
            const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            let captcha = "";
            for (let i = 0; i < 6; i++) {
                captcha += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            currentCaptchaCode = captcha;
            document.getElementById('captchaDisplay').innerText = captcha;
            document.getElementById('regCaptcha').value = "";
        }

        // Chạy hàm tạo mã ngay khi trang vừa tải xong
        window.onload = generateCaptcha;

        // Xử lý sự kiện Submit
        document.getElementById('registerForm').addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            const empId = document.getElementById('regEmpId').value.trim();
            const fullName = document.getElementById('regFullName').value.trim();
            const password = document.getElementById('regPassword').value;
            const userInputCaptcha = document.getElementById('regCaptcha').value.trim().toUpperCase();
            
            const alertBox = document.getElementById('alertMessage');
            const btnSubmit = document.getElementById('btnSubmitReg');

            // Kiểm tra CAPTCHA
            if (userInputCaptcha !== currentCaptchaCode) {
                alertBox.textContent = "Mã xác thực CAPTCHA không chính xác!";
                alertBox.style.display = "block";
                alertBox.style.backgroundColor = "#FEE2E2";
                alertBox.style.color = "#991B1B";
                alertBox.style.borderColor = "#F87171";
                generateCaptcha(); 
                return;
            }

            // Hiển thị trạng thái đang gửi
            alertBox.style.display = "none";
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang gửi dữ liệu...';

            // ĐÓNG GÓI DỮ LIỆU ĐỂ GỬI LÊN GOOGLE FORM
            let urlEncodedData = new URLSearchParams();
            
            urlEncodedData.append('entry.198596200', empId);      // Mã số nhân viên
            urlEncodedData.append('entry.1493392278', fullName);  // Họ và tên
            urlEncodedData.append('entry.877202675', password);   // Mật khẩu

            // Đã xóa chữ /u/0/ để tránh lỗi liên quan đến phiên đăng nhập
            let formURL = "https://docs.google.com/forms/d/e/1FAIpQLScw93TaZ7vI2hK-b12v76SyMW_jYJVScZB9XGJ2stxkkPn3lw/formResponse";

            // GỬI DỮ LIỆU
            fetch(formURL, {
                method: "POST",
                mode: "no-cors", 
                headers: {
                    // Đã sửa lại lỗi chính tả (urleoded -> urlencoded)
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: urlEncodedData.toString()
            }).then(() => {
                // Do mode no-cors luôn trả về status 0 nên sẽ nhảy vào block này nếu fetch thực thi xong
                alertBox.textContent = "Đăng ký thành công! Đang chuyển hướng...";
                alertBox.style.display = "block";
                alertBox.style.backgroundColor = "#D1FAE5";
                alertBox.style.color = "#065F46";
                alertBox.style.borderColor = "#34D399";
                
                btnSubmit.innerHTML = '<i class="fa-solid fa-check"></i> Hoàn tất';
                
                // Đặt lại các trường về rỗng (tùy chọn)
                document.getElementById('registerForm').reset();
                generateCaptcha();
                
                // Đổi "#" thành đường dẫn thực tế, ví dụ: window.location.href = "index.html";
                setTimeout(() => { 
                    window.location.href = "#"; 
                }, 3000);

            }).catch(error => {
                // Xử lý khi bị lỗi mạng
                alertBox.textContent = "Lỗi kết nối! Vui lòng thử lại.";
                alertBox.style.display = "block";
                alertBox.style.backgroundColor = "#FEE2E2";
                alertBox.style.color = "#991B1B";
                alertBox.style.borderColor = "#F87171";
                
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = 'Đăng ký ngay <i class="fa-solid fa-user-plus"></i>';
            });
        });