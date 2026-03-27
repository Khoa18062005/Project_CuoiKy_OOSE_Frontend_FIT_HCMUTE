// const ROOM_SEARCH_API = "http://localhost:8080/api/rooms/search";

// // ── Helpers ────────────────────────────────────────────────────────────────

// function getJwtToken() {
//     return localStorage.getItem("jwt_token");
// }

// function formatCurrency(amount) {
//     return new Intl.NumberFormat("vi-VN", {
//         style: "currency",
//         currency: "VND"
//     }).format(amount);
// }

// // ── Render kết quả ─────────────────────────────────────────────────────────

// function renderRooms(data, container) {
//     const { rooms, totalFound, requested, enough, warning } = data;

//     // Header tổng kết
//     let headerHtml = `
//         <div style="
//             display:flex; justify-content:space-between; align-items:center;
//             margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid #e2e8f0;
//         ">
//             <h2 style="margin:0; font-size:1.1rem; color:#1e293b;">
//                 Tìm thấy <strong>${totalFound}</strong> phòng trống
//                 &nbsp;·&nbsp; Bạn yêu cầu <strong>${requested}</strong> phòng
//             </h2>
//         </div>`;

//     // Cảnh báo nếu không đủ phòng
//     let warningHtml = "";
//     if (warning) {
//         warningHtml = `
//             <div style="
//                 background:#fffbeb; border:1px solid #fcd34d; border-radius:8px;
//                 padding:12px 16px; margin-bottom:16px; color:#92400e; font-size:.9rem;
//             ">
//                 ⚠️ ${warning}
//             </div>`;
//     }

//     if (!rooms || rooms.length === 0) {
//         container.innerHTML = headerHtml + `
//             <div style="text-align:center; padding:40px; color:#888;">
//                 <i class="fas fa-door-closed" style="font-size:3rem; margin-bottom:12px; display:block;"></i>
//                 Không tìm thấy phòng phù hợp cho lịch này.
//             </div>`;
//         return;
//     }

//     const roomCardsHtml = rooms.map(room => `
//         <div class="room-card" style="
//             border:1px solid #e2e8f0; border-radius:12px; padding:20px;
//             margin-bottom:16px; display:flex; justify-content:space-between;
//             align-items:center; background:#fff; box-shadow:0 2px 8px rgba(0,0,0,.06);
//         ">
//             <div>
//                 <h3 style="margin:0 0 6px; font-size:1.1rem;">
//                     Phòng ${room.roomNumber}
//                     <span style="
//                         background:#f0fdf4; color:#16a34a; font-size:.75rem;
//                         padding:2px 8px; border-radius:99px; font-weight:500; margin-left:8px;
//                     ">Còn trống</span>
//                 </h3>
//                 <p style="margin:0 0 4px; color:#64748b; font-size:.9rem;">
//                     Loại: <strong>${room.roomType.typeName}</strong>
//                     &nbsp;·&nbsp; Sức chứa: <strong>${room.roomType.occupancy} người</strong>
//                 </p>
//                 ${room.description
//                     ? `<p style="margin:4px 0 0; color:#94a3b8; font-size:.85rem;">${room.description}</p>`
//                     : ""}
//             </div>
//             <div style="text-align:right; min-width:150px;">
//                 <div style="font-size:1.25rem; font-weight:700; color:#1e40af;">
//                     ${formatCurrency(room.roomType.priceRoom)}
//                 </div>
//                 <div style="color:#94a3b8; font-size:.8rem; margin-bottom:10px;">/ đêm</div>
//                 <button
//                     onclick="handleBookRoom(${room.roomID}, '${room.roomNumber}')"
//                     style="
//                         background:#1e40af; color:#fff; border:none;
//                         padding:8px 18px; border-radius:8px; cursor:pointer;
//                         font-size:.9rem; font-weight:600;
//                     "
//                 >Đặt ngay</button>
//             </div>
//         </div>
//     `).join("");

//     container.innerHTML = headerHtml + warningHtml + roomCardsHtml;
// }

// // ── Xử lý nút Đặt ngay ────────────────────────────────────────────────────

// function handleBookRoom(roomID, roomNumber) {
//     const token = getJwtToken();
//     if (!token) {
//         alert("Bạn cần đăng nhập để đặt phòng!");
//         window.location.href = "login.html";
//         return;
//     }
//     // TODO: chuyển sang trang booking với roomID
//     alert(`Đặt phòng ${roomNumber} (ID: ${roomID}) — chức năng đang phát triển`);
// }

// // ── Fetch API ──────────────────────────────────────────────────────────────

// async function searchRooms(params) {
//     // Tạo result container nếu chưa có
//     let resultSection = document.getElementById("room-results");
//     if (!resultSection) {
//         resultSection = document.createElement("section");
//         resultSection.id = "room-results";
//         resultSection.style.cssText = "max-width:900px; margin:32px auto; padding:0 16px;";
//         document.querySelector(".room-search-section")
//                 .insertAdjacentElement("afterend", resultSection);
//     }

//     // Loading state
//     resultSection.innerHTML = `
//         <div style="text-align:center; padding:40px; color:#64748b;">
//             <i class="fas fa-spinner fa-spin" style="font-size:2rem; margin-bottom:12px; display:block;"></i>
//             Đang tìm kiếm phòng...
//         </div>`;

//     // Build query string — chỉ đính roomType nếu không phải "all"
//     const queryParams = {
//         checkin:        params.checkin,
//         checkout:       params.checkout,
//         guests:         params.guests,
//         numberOfRooms:  params.numberOfRooms,
//     };
//     if (params.roomType && params.roomType !== "all") {
//         queryParams.roomType = params.roomType;
//     }
//     const query = new URLSearchParams(queryParams);

//     // Header: gắn JWT nếu có (route này public nên không bắt buộc)
//     const headers = { "Content-Type": "application/json" };
//     const token = getJwtToken();
//     if (token) headers["Authorization"] = `Bearer ${token}`;

//     try {
//         const response = await fetch(`${ROOM_SEARCH_API}?${query}`, {
//             method: "GET",
//             headers,
//             credentials: "include"
//         });

//         const data = await response.json();

//         if (response.ok) {
//             // data là RoomSearchResponse
//             renderRooms(data, resultSection);
//         } else {
//             // data là {status, message} hoặc {status, errors}
//             const msg = data.message
//                 || (data.errors && data.errors.map(e => e.defaultMessage).join(", "))
//                 || "Lỗi không xác định";
//             resultSection.innerHTML = `
//                 <div style="text-align:center; padding:32px; color:#dc2626;">
//                     <i class="fas fa-exclamation-circle"
//                        style="font-size:2rem; margin-bottom:8px; display:block;"></i>
//                     ${msg}
//                 </div>`;
//         }
//     } catch (err) {
//         console.error("Lỗi kết nối:", err);
//         resultSection.innerHTML = `
//             <div style="text-align:center; padding:32px; color:#dc2626;">
//                 ⚠️ Không thể kết nối tới máy chủ. Vui lòng thử lại.
//             </div>`;
//     }
// }

// // ── Submit form ────────────────────────────────────────────────────────────

// document.addEventListener("DOMContentLoaded", () => {
//     const form = document.getElementById("roomSearchForm");
//     if (!form) return;

//     // Set min date = hôm nay
//     const today = new Date().toISOString().split("T")[0];
//     const checkinInput  = form.querySelector("[name='checkin']");
//     const checkoutInput = form.querySelector("[name='checkout']");
//     if (checkinInput)  checkinInput.min  = today;
//     if (checkoutInput) checkoutInput.min = today;

//     // Khi đổi checkin → checkout phải sau checkin
//     checkinInput?.addEventListener("change", () => {
//         if (checkoutInput) checkoutInput.min = checkinInput.value;
//         if (checkoutInput.value && checkoutInput.value <= checkinInput.value) {
//             checkoutInput.value = "";
//         }
//     });

//     form.addEventListener("submit", async (e) => {
//         e.preventDefault();

//         const checkin       = form.querySelector("[name='checkin']").value;
//         const checkout      = form.querySelector("[name='checkout']").value;
//         const guests        = form.querySelector("[name='guests']").value;
//         const numberOfRooms = form.querySelector("[name='rooms']").value;  // name="rooms" trong HTML của bạn
//         const roomType      = form.querySelector("[name='roomType']").value;

//         if (!checkin || !checkout) {
//             alert("Vui lòng chọn ngày nhận và trả phòng!");
//             return;
//         }

//         await searchRooms({ checkin, checkout, guests, numberOfRooms, roomType });
//     });
// });