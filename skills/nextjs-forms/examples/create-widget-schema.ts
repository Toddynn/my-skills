import { array, object, string } from "zod/v4";
import { CreateWidgetFormFieldsSchema } from "./create-widget-form-fields-schema";

export const CreateWidgetSchema = CreateWidgetFormFieldsSchema.extend({
  archives: array(object({ archive: string() })).optional(),
});
