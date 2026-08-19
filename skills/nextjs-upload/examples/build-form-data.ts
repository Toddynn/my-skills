export function buildCreateWidgetFormData(parsed: {
  name: string;
  archives?: Array<{ icon?: string; archive: Blob }>;
}) {
  const formData = new FormData();
  formData.append("name", parsed.name);
  parsed.archives?.forEach((item, index) => {
    formData.append(`archives[${index}][archive]`, item.archive);
    if (item.icon) formData.append(`archives[${index}][icon]`, item.icon);
  });
  return formData;
}
