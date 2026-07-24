"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Cog, FileInput, Gauge, Layers3 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { SelectControl } from "@/components/ui/select";
import {
  CompletionList,
  FormControl,
  ReadOnlyFact,
  WorkflowProgress,
  WorkflowSection,
  workflowTextareaClass,
} from "@/components/domain/workflow-form";
import { getMachines, getNotices } from "@/lib/data";

const PARTS = ["前片", "后片", "袖", "罗纹", "领", "下摆"];
const FOLD_OPTIONS = ["DA · 平铺", "DB · 对折", "DC · 分片叠放"];
const TENSION_OPTIONS = ["A · 标准", "B · 偏紧"];

type WorkorderForm = {
  noticeId: string;
  programName: string;
  part: string;
  machineId: string;
  gsm: string;
  finishedWeight: string;
  stitchSec: string;
  ratio: string;
  composition: string;
  fold: string;
  tension: string;
  weaveNote: string;
  dyeNote: string;
  fillDate: string;
};

const INITIAL_FORM: WorkorderForm = {
  noticeId: "",
  programName: "",
  part: "",
  machineId: "",
  gsm: "",
  finishedWeight: "",
  stitchSec: "",
  ratio: "",
  composition: "",
  fold: "",
  tension: "",
  weaveNote: "",
  dyeNote: "",
  fillDate: "2026-07-23",
};

export default function NewSampleWorkorderPage() {
  const router = useRouter();
  const notices = useMemo(() => getNotices(), []);
  const machines = useMemo(() => getMachines(), []);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const selectedNotice = notices.find((row) => row.id === form.noticeId);
  const selectedMachine = machines.find((row) => row.id === form.machineId);
  const machineName = selectedMachine?.modelSpec ?? selectedMachine?.machine ?? "—";
  const needle = selectedMachine?.needle ?? "—";
  const rpm = selectedMachine?.rpm ?? "—";

  const readiness = [
    { label: "承接通知", done: Boolean(form.noticeId && form.programName), href: "#workorder-step-1" },
    { label: "机台参数", done: Boolean(form.machineId && Number(form.gsm) > 0), href: "#workorder-step-2" },
    { label: "配比与要求", done: Boolean(form.ratio && form.composition), href: "#workorder-step-3" },
    { label: "核对并下发", done: Boolean(Number(form.finishedWeight) > 0 && Number(form.stitchSec) > 0), href: "#workorder-step-4" },
  ];

  function update<K extends keyof WorkorderForm>(key: K, value: WorkorderForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: "" }));
  }

  function chooseNotice(id: string) {
    const notice = notices.find((row) => row.id === id);
    setForm((current) => ({
      ...current,
      noticeId: id,
      gsm: String(notice?.specs?.gsm ?? current.gsm),
      programName: current.programName || (notice ? `WO${notice.id.slice(-6).replaceAll("-", "")}` : ""),
    }));
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!form.noticeId) next.noticeId = "请选择需要承接的打样通知";
    if (!form.programName) next.programName = "请输入车间可识别的程序名";
    if (!form.part) next.part = "请选择当前工艺覆盖的部件";
    if (!form.machineId) next.machineId = "请选择生产机型";
    if (Number(form.gsm) <= 0) next.gsm = "请输入大于 0 的目标克重";
    if (Number(form.finishedWeight) <= 0) next.finishedWeight = "请输入首件下机克重";
    if (Number(form.stitchSec) <= 0) next.stitchSec = "请输入首件下机时间";
    if (!form.ratio) next.ratio = "请输入纱线配比";
    if (!form.composition) next.composition = "请输入成分说明";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit() {
    if (!validate()) {
      toast.error("还有工艺参数未完成", { description: "请检查页面中标红的项目。" });
      return;
    }
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    const newId = `WO-${String(Date.now()).slice(-6)}`;
    console.info("【打样工艺】工艺单已保存并进入待审核队列", {
      工艺单编号: newId,
      来源通知: form.noticeId,
      程序名: form.programName,
      机型: machineName,
      目标克重: form.gsm,
    });
    toast.success("工艺单已保存", { description: `${form.programName} · 等待审核后下发车间` });
    router.push("/orders/sample-workorders");
  }

  return (
    <AdminShell
      pageTitle="新建打样工艺"
      pageDescription="承接一张打样通知，确定程序、机型、首件参数和工艺要求，保存后进入待审核队列。"
      pageActions={(
        <>
          <Link href="/orders/sample-workorders"><Button variant="ghost" size="md">取消</Button></Link>
          <Button form="workorder-workflow" type="submit" size="md" disabled={saving}>
            {saving ? "正在保存…" : "保存并提交审核"}
          </Button>
        </>
      )}
      pageMeta={[
        { label: "完成度", value: `${readiness.filter((item) => item.done).length}/4` },
        { label: "机型", value: form.machineId ? machineName : "待选择" },
        { label: "目标克重", value: form.gsm ? `${form.gsm}g` : "待填写" },
      ]}
    >
      <form id="workorder-workflow" className="mx-auto max-w-[1440px] px-8 py-6" onSubmit={(event) => { event.preventDefault(); submit(); }}>
        <Link href="/orders/sample-workorders" className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-[var(--ink-mute)] hover:text-[var(--ink)]">
          <ArrowLeft className="h-3.5 w-3.5" />返回工艺执行台账
        </Link>
        <WorkflowProgress items={readiness} />

        <div className="mt-5 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            <WorkflowSection id="workorder-step-1" index="01" title="承接打样通知" description="选择上游通知，客户、产品、尺码和交期作为只读信息带入。">
              <div className="grid gap-4 md:grid-cols-2">
                <FormControl label="打样通知" required error={errors.noticeId}>
                  <SelectControl
                    value={form.noticeId || undefined}
                    onValueChange={chooseNotice}
                    placeholder="请选择待处理通知"
                    options={notices.map((row) => ({ value: row.id, label: `${row.id} · ${row.product}` }))}
                  />
                </FormControl>
                <FormControl label="程序名" required error={errors.programName}>
                  <Input value={form.programName} onChange={(e) => update("programName", e.target.value)} placeholder="如：WO0317-DBL-AURON" mono />
                </FormControl>
              </div>
              <div className="grid gap-px overflow-hidden rounded-md border border-[var(--hairline)] bg-[var(--hairline)] sm:grid-cols-2 lg:grid-cols-4">
                <ReadOnlyFact label="客户" value={selectedNotice?.customerName ?? selectedNotice?.customer ?? "—"} />
                <ReadOnlyFact label="产品" value={selectedNotice?.product ?? "—"} />
                <ReadOnlyFact label="尺码 / 数量" value={selectedNotice ? `${selectedNotice.sizeRange} · ${selectedNotice.qty} 件` : "—"} />
                <ReadOnlyFact label="计划交样" value={selectedNotice?.deliveryDate ?? "—"} mono />
              </div>
            </WorkflowSection>

            <WorkflowSection id="workorder-step-2" index="02" title="确定机台与首件参数" description="选择机型后自动带入针数和参考转速，只录入本次实际目标。">
              <div className="grid gap-4 md:grid-cols-2">
                <FormControl label="机型" required error={errors.machineId}>
                  <SelectControl
                    value={form.machineId || undefined}
                    onValueChange={(value) => update("machineId", value)}
                    placeholder="请选择机型"
                    options={machines.map((row) => ({ value: row.id, label: `${row.modelSpec ?? row.machine} · ${row.needle ?? "—"}G` }))}
                  />
                </FormControl>
                <FormControl label="覆盖部件" required error={errors.part}>
                  <SelectControl
                    value={form.part || undefined}
                    onValueChange={(value) => update("part", value)}
                    placeholder="请选择部件"
                    options={PARTS.map((value) => ({ value, label: value }))}
                  />
                </FormControl>
              </div>
              <div className="grid gap-px overflow-hidden rounded-md border border-[var(--hairline)] bg-[var(--hairline)] sm:grid-cols-3">
                <ReadOnlyFact label="机型" value={machineName} />
                <ReadOnlyFact label="针数" value={needle === "—" ? "—" : `${needle}G`} mono />
                <ReadOnlyFact label="参考转速" value={rpm === "—" ? "—" : `${rpm} 转/min`} mono />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <FormControl label="目标平方克重" required error={errors.gsm}><Input type="number" min="1" value={form.gsm} onChange={(e) => update("gsm", e.target.value)} mono /></FormControl>
                <FormControl label="首件下机克重" required error={errors.finishedWeight}><Input type="number" min="1" value={form.finishedWeight} onChange={(e) => update("finishedWeight", e.target.value)} mono /></FormControl>
                <FormControl label="首件下机时间（秒）" required error={errors.stitchSec}><Input type="number" min="1" value={form.stitchSec} onChange={(e) => update("stitchSec", e.target.value)} mono /></FormControl>
              </div>
            </WorkflowSection>

            <WorkflowSection id="workorder-step-3" index="03" title="记录配比与执行要求" description="记录车间真正需要执行和复核的信息，详细用料、纱线排列与尺寸在详情页继续维护。">
              <div className="grid gap-4 md:grid-cols-2">
                <FormControl label="纱线配比" required error={errors.ratio}><Input value={form.ratio} onChange={(e) => update("ratio", e.target.value)} placeholder="如：60/40" mono /></FormControl>
                <FormControl label="成分说明" required error={errors.composition}><Input value={form.composition} onChange={(e) => update("composition", e.target.value)} placeholder="如：60% 澳毛 + 40% 长绒棉" /></FormControl>
                <FormControl label="叠放要求">
                  <SelectControl value={form.fold || undefined} onValueChange={(value) => update("fold", value)} options={FOLD_OPTIONS.map((value) => ({ value, label: value }))} />
                </FormControl>
                <FormControl label="张力要求">
                  <SelectControl value={form.tension || undefined} onValueChange={(value) => update("tension", value)} options={TENSION_OPTIONS.map((value) => ({ value, label: value }))} />
                </FormControl>
                <FormControl label="织造注意事项"><textarea rows={3} className={workflowTextareaClass} value={form.weaveNote} onChange={(e) => update("weaveNote", e.target.value)} placeholder="如：前 30 圈慢速，罗纹段注意张力" /></FormControl>
                <FormControl label="染整备注"><textarea rows={3} className={workflowTextareaClass} value={form.dyeNote} onChange={(e) => update("dyeNote", e.target.value)} placeholder="如：低温缸染，色牢度 ≥ 4 级" /></FormControl>
              </div>
            </WorkflowSection>

            <WorkflowSection id="workorder-step-4" index="04" title="核对并提交审核" description="确认来源、机台和首件参数。审核通过后再下发车间，避免未核对的工艺直接执行。">
              <div className="grid gap-4 md:grid-cols-2">
                <FormControl label="填写日期"><DatePicker value={form.fillDate} onChange={(value) => update("fillDate", value)} aria-label="填写日期" /></FormControl>
                <div className="rounded-md border border-[var(--hairline)] bg-[var(--secondary)]/25 px-4 py-3 text-[12px] leading-5 text-[var(--ink-dim)]">
                  保存后进入“等待审核”。审核通过前不会推送车间，也不会开始计算正式报价。
                </div>
              </div>
            </WorkflowSection>
          </div>

          <aside className="sticky top-[72px] space-y-4">
            <section className="rounded-lg border border-[var(--hairline)] bg-[var(--card)]">
              <header className="border-b border-[var(--hairline)] px-5 py-4"><div className="flex items-center gap-2"><Layers3 className="h-4 w-4 text-[var(--primary)]" /><h2 className="text-[15px] font-semibold">工艺摘要</h2></div></header>
              <div className="space-y-4 p-5">
                <Summary icon={<FileInput />} label="来源通知" value={form.noticeId || "待选择"} />
                <Summary icon={<Cog />} label="程序与机型" value={`${form.programName || "待填写"} · ${form.machineId ? machineName : "待选择机型"}`} />
                <Summary icon={<Gauge />} label="首件参数" value={`${form.gsm || "—"}g/m² · ${form.finishedWeight || "—"}g · ${form.stitchSec || "—"}秒`} />
              </div>
            </section>
            <section className="rounded-lg border border-[var(--hairline)] bg-[var(--card)] p-5">
              <div className="mb-3 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--ink-dim)]" /><h2 className="text-[14px] font-semibold">完成情况</h2></div>
              <CompletionList items={readiness} />
            </section>
          </aside>
        </div>
      </form>
    </AdminShell>
  );
}

function Summary({ icon, label, value }: { icon: React.ReactElement<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-[var(--ink-mute)] [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      <div><p className="text-[11px] text-[var(--ink-mute)]">{label}</p><p className="mt-1 text-[13px] font-medium leading-5 text-[var(--ink)]">{value}</p></div>
    </div>
  );
}
