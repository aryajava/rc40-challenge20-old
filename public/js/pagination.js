let currentPage = 1; // Halaman awal
let totalPages = 0;
const itemsPerPage = 5;

// Fungsi untuk mengatur pagination
export function setupPagination(totalItems) {
  totalPages = Math.ceil(totalItems / itemsPerPage);
  renderPaginationControls();
}

// Fungsi untuk merender kontrol pagination
function renderPaginationControls() {
  const paginationControls = document.getElementById("pagination-controls");
  paginationControls.innerHTML = ""; // Kosongkan konten sebelumnya

  if (totalPages > 1) {
    // Hanya tampilkan kontrol jika total halaman lebih dari 1
    // Tombol halaman sebelumnya
    if (currentPage > 1) {
      const prevButton = document.createElement("button");
      prevButton.textContent = "Previous";
      prevButton.onclick = () => goToPage(currentPage - 1); // Pindah ke halaman sebelumnya
      paginationControls.appendChild(prevButton);
    }

    // Tombol nomor halaman
    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement("button");
      pageButton.textContent = i;
      pageButton.onclick = () => goToPage(i);
      if (i === currentPage) {
        pageButton.disabled = true; // Nonaktifkan tombol jika sedang di halaman saat ini
      }
      paginationControls.appendChild(pageButton);
    }

    // Tombol halaman berikutnya
    if (currentPage < totalPages) {
      const nextButton = document.createElement("button");
      nextButton.textContent = "Next";
      nextButton.onclick = () => goToPage(currentPage + 1); // Pindah ke halaman berikutnya
      paginationControls.appendChild(nextButton);
    }
  }
}

// Fungsi untuk berpindah halaman
export function goToPage(page) {
  if (page < 1 || page > totalPages) return; // Cek jika halaman valid
  currentPage = page; // Update currentPage
  renderPage(currentPage); // Render data untuk halaman saat ini
}

// Fungsi untuk mengambil dan merender data pada halaman tertentu
export async function renderPage(page) {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("page", page);
    const response = await fetch(`/?${urlParams.toString()}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Data: ", data);

    const tbody = document.getElementById("data-tbody");
    tbody.innerHTML = "";
    data.rows.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
          <td>${row.id}</td>
          <td>${row.name}</td>
          <td>${row.height}</td>
          <td>${row.weight}</td>
          <td>${row.birthdate}</td>
          <td>${row.married ? "Yes" : "No"}</td>
          <td>
            <form action="/edit/${row.id}" method="get">
              <button type="submit">Edit</button>
            </form>
            <form action="/delete/${row.id}" method="post">
              <button type="submit">Delete</button>
            </form>
          </td>
        `;
      tbody.appendChild(tr);
    });

    totalPages = Math.ceil(data.totalItems / itemsPerPage); // Update totalPages based on actual data
    renderPaginationControls(); // Update tombol pagination setelah data dirender
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
