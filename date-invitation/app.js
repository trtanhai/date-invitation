import { firebaseConfig } from "./firebase-config.js";

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";

import {
  getAuth,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  push,
  set
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-database.js";


// ========================================
// 1. LẤY CÁC PHẦN TỬ HTML
// ========================================

const openLetterButton = document.getElementById("openLetter");
const letterContent = document.getElementById("letterContent");
const tapHint = document.getElementById("tapHint");

const responseNote = document.getElementById("responseNote");
const statusMessage = document.getElementById("statusMessage");

const responseButtons = document.querySelectorAll("[data-answer]");

const musicButton = document.getElementById("musicButton");
const musicStatus = document.getElementById("musicStatus");
const backgroundMusic = document.getElementById("backgroundMusic");


// ========================================
// 2. CẤU HÌNH FIREBASE
// ========================================

let database = null;
let firebaseReady = false;

function isFirebaseConfigured() {
  return (
    firebaseConfig.apiKey !== "YOUR_API_KEY" &&
    firebaseConfig.projectId !== "YOUR_PROJECT_ID" &&
    firebaseConfig.databaseURL !== "YOUR_DATABASE_URL" &&
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.databaseURL
  );
}

async function connectFirebase() {
  if (!isFirebaseConfigured()) {
    console.warn("Bạn chưa cấu hình Firebase.");
    return;
  }

  try {
    const app = initializeApp(firebaseConfig);

    const auth = getAuth(app);

    database = getDatabase(app);

    await signInAnonymously(auth);

    firebaseReady = true;

    console.log("Firebase đã kết nối thành công.");

  } catch (error) {
    console.error("Không thể kết nối Firebase:", error);

    firebaseReady = false;
  }
}


// Kết nối Firebase khi website khởi động.
await connectFirebase();


// ========================================
// 3. MỞ PHONG BÌ
// ========================================

openLetterButton.addEventListener("click", () => {
  openLetterButton.classList.add("opened");

  letterContent.hidden = false;

  tapHint.textContent = "Một lời mời nhỏ dành cho bà 💗";

  openLetterButton.disabled = true;
});


// ========================================
// 4. BẬT / TẮT NHẠC
// ========================================

musicButton.addEventListener("click", async () => {
  if (backgroundMusic.paused) {
    try {
      await backgroundMusic.play();

      musicButton.textContent = "⏸ Tắt nhạc";

      musicStatus.textContent = "Đang phát một chút nhạc nhẹ 🎵";

    } catch (error) {
      console.error("Không phát được nhạc:", error);

      musicStatus.textContent =
        "Chưa tìm thấy nhạc. Hãy kiểm tra file background.mp3 nhé!";
    }

  } else {
    backgroundMusic.pause();

    musicButton.textContent = "🎵 Bật nhạc";

    musicStatus.textContent = "Nhạc đã tạm dừng";
  }
});


// ========================================
// 5. GỬI PHẢN HỒI LÊN FIREBASE
// ========================================

async function saveResponse(answer) {
  const message = responseNote.value.trim();

  if (!firebaseReady || !database) {
    statusMessage.textContent =
      "Website chưa kết nối Firebase. Hãy kiểm tra firebase-config.js và kết nối mạng.";

    return;
  }

  // Tránh người dùng nhấn liên tục trong lúc gửi.
  responseButtons.forEach((button) => {
    button.disabled = true;
  });

  statusMessage.textContent = "Đang gửi phản hồi... 💌";

  try {
    // Tạo một bản ghi phản hồi mới.
    const responseRef = push(ref(database, "responses"));

    await set(responseRef, {
      name: "Lan Vy",
      answer: answer,
      message: message,
      createdAt: Date.now()
    });

    if (answer === "yes") {
      statusMessage.textContent =
        "Đã gửi phản hồi thành công! Hải sẽ biết tin vui này nhé 💖";
    } else {
      statusMessage.textContent =
        "Đã gửi phản hồi thành công! Cảm ơn bà đã trả lời Hải 🌷";
    }

  } catch (error) {
    console.error("Lỗi gửi phản hồi:", error);

    statusMessage.textContent =
      "Chưa gửi được phản hồi. Hãy thử lại sau nhé.";

    responseButtons.forEach((button) => {
      button.disabled = false;
    });
  }
}


// ========================================
// 6. XỬ LÝ HAI NÚT PHẢN HỒI
// ========================================

responseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const answer = button.dataset.answer;

    saveResponse(answer);
  });
});