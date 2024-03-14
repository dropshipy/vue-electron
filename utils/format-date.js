const formatDate = (
  date,
  format = { day: "2-digit", month: "2-digit", year: "numeric" }
) => {
  const formattedDate = new Intl.DateTimeFormat("id-ID", format).format(
    new Date(date)
  );
  return formattedDate.replace(/\//g, "-");
};

export default formatDate;
