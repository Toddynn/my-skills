import { Card, CardFooter } from "@/components/ui/card";
import { WidgetActions } from "@/components/ui/composition-pattern/actions/widgets";
import { WidgetCardUI } from "@/components/ui/composition-pattern/cards/widgets";
import { DatesUI } from "@/components/ui/composition-pattern/dates";
import type { Widget } from "@/shared/functions/tanstack-query/widgets/get-all";

export function WidgetCard({ widget }: { widget: Widget }) {
  return (
    <Card>
      <WidgetCardUI.Title name={widget.name} />
      <CardFooter>
        <DatesUI.CreatedAt date={widget.createdAt} />
        <WidgetActions.OpenEditWidgetModal widget={widget} />
        <WidgetActions.DeleteWidget widget={widget} />
      </CardFooter>
    </Card>
  );
}
