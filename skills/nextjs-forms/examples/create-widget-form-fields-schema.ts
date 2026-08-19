import { object, string } from "zod/v4";

export const CreateWidgetFormFieldsSchema = object({
  name: string().trim().min(1, "Nome é obrigatório"),
});
