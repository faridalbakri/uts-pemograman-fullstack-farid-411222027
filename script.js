const API_URL = "http://localhost:3000/api/media";
const mediaTableBody = document.getElementById("mediaTableBody");
const mediaModal = new bootstrap.Modal(document.getElementById("mediaModal"));
const mediaForm = document.getElementById("mediaForm");
const mediaIdInput = document.getElementById("mediaId");
const modalJudul = document.getElementById("mediaModalLabel");
const saveButton = document.getElementById("saveButton");
const alertMessage = document.getElementById("alertMessage");

function formatDate(dateString) {
  const d = new Date(dateString);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

// =======================================================
// === 1. READ (GET) - Mengambil Data ====================
// =======================================================
async function fetchMedia() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Gagal memuat media: " + response.statusText);
    }
    const media = await response.json();
    renderMedia(media);
  } catch (error) {
    console.error("Error fetching media:", error);
    mediaTableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Gagal
terhubung ke API: ${error.message}</td></tr>`;
  }
}
function renderMedia(media) {
  mediaTableBody.innerHTML = "";
  if (media.length === 0) {
    mediaTableBody.innerHTML = `<tr><td colspan="5" class="text-center">Belum ada data media.</td></tr>`;
    return;
  }

  media.forEach((m) => {
    const row = mediaTableBody.insertRow();
    row.insertCell().textContent = m.id_media; // ID
    row.insertCell().textContent = m.judul; // Judul
    row.insertCell().textContent = m.genre; // Genre
    row.insertCell().textContent = formatDate(m.tahun_rilis); // Tahun Rilis

    const actionsCell = row.insertCell();

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-sm btn-info me-2";
    editBtn.textContent = "Edit";
    editBtn.onclick = () =>
      prepareEdit(m.id_media, m.judul, m.tahun_rilis, m.genre);
    actionsCell.appendChild(editBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-sm btn-danger";
    deleteBtn.textContent = "Hapus";
    deleteBtn.onclick = () => deleteMedia(m.id_media, m.judul);
    actionsCell.appendChild(deleteBtn);
  });
}

// =======================================================
// === 2. CREATE & UPDATE (POST & PUT) ===================
// =======================================================
mediaForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id_media = mediaIdInput.value;
  const judul = document.getElementById("judul").value;
  const tahun_rilis = document.getElementById("tahun_rilis").value;
  const genre = document.getElementById("genre").value;

  const method = id_media ? "PUT" : "POST";
  const url = id_media ? `${API_URL}/${id_media}` : API_URL;

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ judul, tahun_rilis, genre }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Gagal menyimpan media.");
    }

    showAlert(
      `Media berhasil ${id_media ? "diperbarui" : "ditambahkan"}!`,
      "success"
    );
    mediaModal.hide();
    fetchMedia();
    mediaForm.reset();
  } catch (error) {
    showAlert(`Gagal menyimpan media: ${error.message}`, "danger");
  }
});

// Fungsi untuk menyiapkan modal mode "Create"
function prepareCreate() {
  modalJudul.textContent = "Tambah media Baru";
  saveButton.textContent = "Tambah";
  mediaIdInput.value = "";
  mediaForm.reset();
}
// Fungsi untuk menyiapkan modal mode "Update"
function prepareEdit(id_media, judul, tahun_rilis, genre) {
  modalJudul.textContent = "Edit Media";
  saveButton.textContent = "Perbarui";
  mediaIdInput.value = id_media;
  document.getElementById("judul").value = judul;
  document.getElementById("tahun_rilis").value = tahun_rilis;
  document.getElementById("genre").value = genre;
  mediaModal.show();
}

// =======================================================
// === 3. DELETE (DELETE) ================================
// =======================================================
async function deleteMedia(id_media, judul) {
  if (!confirm(`Yakin ingin menghapus media: "${judul}" (ID: ${id_media})?`))
    return;

  try {
    const response = await fetch(`${API_URL}/${id_media}`, {
      method: "DELETE",
    });
    if (response.status === 204) {
      showAlert(`Media "${judul}" berhasil dihapus.`, "warning");
      fetchMedia();
    } else if (response.status === 404) {
      showAlert(`Media dengan ID ${id_media} tidak ditemukan.`, "danger");
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Gagal menghapus media.");
    }
  } catch (error) {
    showAlert(`Gagal menghapus media: ${error.message}`, "danger");
  }
}

// =======================================================
// === UTILITAS ==========================================
// =======================================================
function showAlert(message, type) {
  alertMessage.textContent = message;
  alertMessage.className = `alert alert-${type}`;
  alertMessage.classList.remove("d-none");
  // Hilangkan peringatan setelah 3 detik
  setTimeout(() => {
    alertMessage.classList.add("d-none");
  }, 3000);
}
// Panggil fungsi untuk memuat data saat halaman dimuat
document.addEventListener("DOMContentLoaded", fetchMedia);
