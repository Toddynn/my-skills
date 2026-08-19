import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { LucideTrash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { private_get_all_widgets_query_key } from "@/shared/functions/tanstack-query/widgets/get-all/query-key";
import { useWidgetActions } from "@/routes/_private/widgets/-shared/functions/use-widget-actions";
import type { Widget } from "@/shared/functions/tanstack-query/widgets/get-all";

export function DeleteWidgetAction({ widget }: { widget: Widget }) {
  const confirm = useConfirm();
  const { deleteWidget } = useWidgetActions();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async () =>
      await deleteWidget({
        widget_id: widget.id,
        query_keys_to_invalidate: private_get_all_widgets_query_key({}),
        on_success: () => toast.success("Widget excluído"),
      }),
  });

  const waitForConfirmation = useCallback(async () => {
    const res = await confirm({
      title: "Essa ação irá excluir um widget!",
      description: "Confirme essa ação, por motivos de segurança.",
    });
    if (res) await mutateAsync();
  }, [confirm, mutateAsync]);

  return (
    <Button variant="destructive" disabled={isPending} onClick={waitForConfirmation}>
      <LucideTrash2 />
      Excluir
    </Button>
  );
}
