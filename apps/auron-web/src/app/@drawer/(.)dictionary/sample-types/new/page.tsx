import NewSampleTypePage from "@/app/dictionary/sample-types/new/page";
import { RouteDrawer } from "@/components/layout/route-presentation";

export default function SampleTypeDrawerPage() {
  return (
    <RouteDrawer title="新增样品种类" description="补充打样通知使用的标准分类">
      <NewSampleTypePage />
    </RouteDrawer>
  );
}
