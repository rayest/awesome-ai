import NewDyeingPage from "@/app/dictionary/dyeings/new/page";
import { RouteDrawer } from "@/components/layout/route-presentation";

export default function DyeingDrawerPage() {
  return (
    <RouteDrawer title="新增染色工艺" description="补充可复用的染色方案和计费标准">
      <NewDyeingPage />
    </RouteDrawer>
  );
}
