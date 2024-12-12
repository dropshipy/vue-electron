const XLSX = require("xlsx");
const axios = require("axios");
const fs = require("fs");
const path = require("node:path");
const { formatNumberToShortForm } = require("../helpers/utils");

async function exportDataToSheet(data) {
  let page = 1;
  const limit = 500; // NOTE: set manual
  const { category, search, BASE_URL, store } = data;
  let totalPages;
  const shopeCreatorData = [];

  do {
    const dbCreatorPayload = {
      page,
      limit,
      category,
      search,
    };
    const res = await axios.get(`${BASE_URL}/shopee/shopee-creators/app`, {
      headers: {
        Cookie: store.get("cookies-spt"),
      },
      params: dbCreatorPayload,
    });

    const processedData = res.data.data.map((item) => {
      const relatedCategoris = item.relatedCategoris
        ? item.relatedCategoris.join(", ")
        : "";

      const soldProductCount = item.soldProductCount
        ? item.soldProductCount
            .map((num) => formatNumberToShortForm(num))
            .join(" - ")
        : "";

      const orderRange = item.orderRange
        ? item.orderRange.map((num) => formatNumberToShortForm(num)).join(" - ")
        : "";

      const saleCount = item.saleCount
        ? item.saleCount.map((num) => formatNumberToShortForm(num)).join(" - ")
        : "";

      const maleAudience = item.maleAudience ? item.maleAudience + "%" : "";

      const femaleAudience = item.femaleAudience
        ? item.femaleAudience + "%"
        : "";

      const socialMedias = JSON.parse(item.socialMedias);
      const socialMediaUrls = {
        Instagram: "",
        Tiktok: "",
        Facebook: "",
        Youtube: "",
      };

      socialMedias.forEach((socialMediaData) => {
        const url = socialMediaData.website_url.toLowerCase();
        if (url.includes("instagram.com")) {
          socialMediaUrls.Instagram = socialMediaData.website_url;
        } else if (url.includes("tiktok.com")) {
          socialMediaUrls.Tiktok = socialMediaData.website_url;
        } else if (url.includes("facebook.com")) {
          socialMediaUrls.Facebook = socialMediaData.website_url;
        } else if (url.includes("youtube.com")) {
          socialMediaUrls.Youtube = socialMediaData.website_url;
        }
      });

      return {
        No: item.id,
        "Display Name": item.displayName,
        Username: item.username,
        "Kategori Kreator": relatedCategoris,
        "Jumlah Follower": formatNumberToShortForm(item.totalFollower),
        "Produk Terjual": soldProductCount,
        Pesanan: orderRange,
        Penjualan: saleCount,
        "Audiens Laki Laki": maleAudience,
        "Audiens Perempuan": femaleAudience,
        Instagram: socialMediaUrls.Instagram,
        Tiktok: socialMediaUrls.Tiktok,
        Facebook: socialMediaUrls.Facebook,
        Youtube: socialMediaUrls.Youtube,
      };
    });

    if (!totalPages) {
      totalPages = res.data.pagination.totalPages;
    }
    shopeCreatorData.push(...processedData);
    page++;
  } while (page <= totalPages);

  const filePath = path.join(__dirname, "database-creator-data.xlsx");

  let existingData = [];
  if (fs.existsSync(filePath)) {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets["Sheet1"];
    existingData = XLSX.utils.sheet_to_json(worksheet);
  }

  const combinedData = [...existingData];
  shopeCreatorData.forEach((newItem) => {
    const isDuplicate = existingData.some((existingItem) =>
      Object.keys(existingItem).every(
        (key) => existingItem[key] === newItem[key]
      )
    );

    if (!isDuplicate) {
      combinedData.push(newItem);
    }
  });

  // 4. Buat worksheet baru dari data gabungan
  const ws = XLSX.utils.json_to_sheet(combinedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  XLSX.writeFile(wb, filePath);

  console.log("File berhasil diperbarui di:", filePath);
  return { success: true, filePath };
}

module.exports = { exportDataToSheet };
