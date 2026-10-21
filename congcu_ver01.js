    // =========================================================
        // 1. CẤU HÌNH TỌA ĐỘ CỦA CÔNG TY / BẾN XE (ĐIỂM CHUẨN)
        // Lên Google Maps, chuột phải vào công ty của bạn để lấy Vĩ độ (Lat) và Kinh độ (Lng)
        // =========================================================
        const TARGET_LAT = 10.762622; // Vĩ độ (Ví dụ)
        const TARGET_LNG = 106.660172; // Kinh độ (Ví dụ)
        const ALLOWED_RADIUS = 100; // Bán kính cho phép tính bằng mét (Nên để 100m - 200m trừ hao sai số GPS)
        // =========================================================

        document.getElementById('displayRadius').innerText = ALLOWED_RADIUS;

        const btnCheckin = document.getElementById('btnCheckin');
        const resultBox = document.getElementById('resultBox');
        const resultIcon = document.getElementById('resultIcon');
        const resultTitle = document.getElementById('resultTitle');
        const resultMessage = document.getElementById('resultMessage');
        const resultDetail = document.getElementById('resultDetail');
        const mapLink = document.getElementById('mapLink');

        function startAttendance() {
            const empId = document.getElementById('empId').value.trim();
            if (!empId) {
                alert("Vui lòng nhập Mã nhân viên trước khi điểm danh!");
                return;
            }

            // Reset UI
            resultBox.classList.remove('active', 'result-success', 'result-error');
            mapLink.style.display = 'none';
            btnCheckin.disabled = true;
            btnCheckin.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang định vị GPS...';

            // Kiểm tra xem trình duyệt có hỗ trợ Geolocation không
            if (!navigator.geolocation) {
                showError("Lỗi: Trình duyệt của bạn không hỗ trợ định vị GPS.");
                return;
            }

            // Yêu cầu lấy vị trí với độ chính xác cao nhất
            const options = {
                enableHighAccuracy: true,
                timeout: 10000, // Chờ tối đa 10 giây
                maximumAge: 0   // Không dùng vị trí cũ lưu trong cache
            };

            navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
        }

        function onSuccess(position) {
            const currentLat = position.coords.latitude;
            const currentLng = position.coords.longitude;
            const accuracy = position.coords.accuracy; // Sai số của GPS bằng mét

            // Tính toán khoảng cách
            const distance = calculateDistance(currentLat, currentLng, TARGET_LAT, TARGET_LNG);
            const roundedDistance = Math.round(distance);

            // Hiển thị link Google Maps
            mapLink.href = `https://www.google.com/maps?q=${currentLat},${currentLng}`;
            mapLink.style.display = 'inline-block';

            if (distance <= ALLOWED_RADIUS) {
                // TRONG BÁN KÍNH => THÀNH CÔNG
                showSuccess(`Khoảng cách hợp lệ. Mã NV: ${document.getElementById('empId').value}`, `Cách tâm: ${roundedDistance}m (Sai số GPS: ±${Math.round(accuracy)}m)`);
                
                // --- Ở ĐÂY BẠN CÓ THỂ GỌI API ĐỂ LƯU DỮ LIỆU VÀO GOOGLE SHEETS ---
                // Ví dụ: fetch('URL_GOOGLE_APP_SCRIPT', { method: 'POST', ... })

            } else {
                // NGOÀI BÁN KÍNH => THẤT BẠI
                showError(`Điểm danh thất bại! Bạn đang ở ngoài khu vực quy định.`, `Khoảng cách hiện tại: ${roundedDistance}m (Cho phép: ${ALLOWED_RADIUS}m)`);
            }
        }

        function onError(error) {
            let errorMsg = "";
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg = "Bạn đã từ chối quyền truy cập vị trí. Vui lòng cấp quyền (Allow) trong cài đặt trình duyệt để điểm danh.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg = "Không thể xác định được vị trí của bạn lúc này. Vui lòng bật GPS/Location trên điện thoại.";
                    break;
                case error.TIMEOUT:
                    errorMsg = "Yêu cầu lấy vị trí quá hạn. Vui lòng di chuyển ra nơi thoáng đãng và thử lại.";
                    break;
                default:
                    errorMsg = "Đã xảy ra lỗi không xác định khi lấy vị trí.";
                    break;
            }
            showError(errorMsg);
        }

        function showSuccess(msg, detail = '') {
            resultBox.className = 'result-box result-success active';
            resultIcon.className = 'fa-solid fa-circle-check icon';
            resultTitle.innerText = "Điểm Danh Thành Công!";
            resultTitle.style.color = 'var(--success)';
            resultMessage.innerText = msg;
            resultDetail.innerText = detail;
            resetButton();
        }

        function showError(msg, detail = '') {
            resultBox.className = 'result-box result-error active';
            resultIcon.className = 'fa-solid fa-triangle-exclamation icon';
            resultTitle.innerText = "Điểm Danh Thất Bại";
            resultTitle.style.color = 'var(--danger)';
            resultMessage.innerText = msg;
            resultDetail.innerText = detail;
            resetButton();
        }

        function resetButton() {
            btnCheckin.disabled = false;
            btnCheckin.innerHTML = '<i class="fa-solid fa-fingerprint"></i> Lấy lại vị trí & Điểm danh';
        }

        // =========================================================
        // THUẬT TOÁN HAVERSINE: Tính khoảng cách giữa 2 tọa độ GPS ra số mét
        // =========================================================
        function calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 6371e3; // Bán kính Trái Đất (mét)
            const p1 = lat1 * Math.PI / 180; // Chuyển đổi sang radian
            const p2 = lat2 * Math.PI / 180;
            const dp = (lat2 - lat1) * Math.PI / 180;
            const dl = (lon2 - lon1) * Math.PI / 180;

            const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
                      Math.cos(p1) * Math.cos(p2) *
                      Math.sin(dl / 2) * Math.sin(dl / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            const distance = R * c; 
            return distance;
        }