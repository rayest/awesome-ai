import NewSizePage from "@/app/dictionary/sizes/new/page";
import { RouteDrawer } from "@/components/layout/route-presentation";

export default function SizeDrawerPage() {
  return (
    <RouteDrawer title="新增尺码" description="补充统一尺码和参考号型">
      <NewSizePage />
    </RouteDrawer>
  );
}
