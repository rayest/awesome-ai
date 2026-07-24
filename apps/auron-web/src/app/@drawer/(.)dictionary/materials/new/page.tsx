import NewMaterialPage from "@/app/dictionary/materials/new/page";
import { RouteDrawer } from "@/components/layout/route-presentation";

export default function MaterialDrawerPage() {
  return (
    <RouteDrawer title="新增物料 / 纱线" description="维护物料规格、供应商和采购价格">
      <NewMaterialPage />
    </RouteDrawer>
  );
}
