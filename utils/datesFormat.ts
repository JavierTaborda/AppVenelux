
export const dateMonthText = (dateIn: string) => {
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const date = new Date(dateIn);
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month}, ${year}`;
};


export function formatDateMMM_dot_dd_yyyy(dateString: string): string {

  const date = new Date(dateString);
  const formatter = new Intl.DateTimeFormat('es-ES', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

  const formatted = formatter.format(date); // ex: "18 jun 2025"
  const [day, month, year] = formatted.split(' ');
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);

  return `${capitalizedMonth}. ${day} - ${year}`;
}
export function formatDatedd_dot_MMM_yyyy(dateString?: string): string {
  if (!dateString) return ""; 

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return ""; 

  const formatter = new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  });

  const formatted = formatter.format(date); // ej: "18 jun 2025"
  const [day, month, year] = formatted.split(" ");

  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);

  return `${day} - ${capitalizedMonth}. ${year}`;
}



