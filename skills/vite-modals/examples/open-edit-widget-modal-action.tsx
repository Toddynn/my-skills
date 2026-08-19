import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { useModalControlQuery } from "@/hooks/use-modal-control-query";
import { EditWidgetModal } from "@/components/ui/modals/widgets/edit-widget-modal";
import type { Widget } from "@/shared/functions/tanstack-query/widgets/get-all";

export function OpenEditWidgetModalAction({ widget }: { widget: Widget }) {
  const { control } = useModalControlQuery(`edit-widget:${widget.id}`, {
    key: "modal",
  });

  return (
    <Fragment>
      <Button onClick={() => control.onOpenChange(true)}>Editar</Button>
      <EditWidgetModal control={control} widget={widget} />
    </Fragment>
  );
}
