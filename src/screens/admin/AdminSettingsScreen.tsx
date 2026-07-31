import React from "react";
import { AdminLayout, AdminCard } from "@/screens/admin/AdminLayout";
import { mockAdminRoles } from "@/lib/admin-mock-data";
import { adminSettingsApi, adminRolesApi } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Settings, Users, Bell, Lock, Save,
  Building2, CreditCard, CalendarCheck, Vote,
} from "lucide-react";
export function AdminSettingsScreen() {
  const [activeTab, setActiveTab] = React.useState("branch");
  const [saving, setSaving] = React.useState(false);
  const [settings, setSettings] = React.useState({
    branchName: "NBA Bwari Area Council Branch",
    branchAddress: "Area 3, Bwari, Abuja",
    branchPhone: "+234 805 111 2222",
    branchEmail: "info@nbabwari.org",
    annualDuesAmount: 50000,
    attendanceThreshold: 75,
    votingEligibilityThreshold: 75,
    goodStandingValidityMonths: 12,
    enableBiometricLogin: true,
    enableEmailNotifications: true,
    enableSmsNotifications: true,
    enablePushNotifications: true,
    sessionTimeoutMinutes: 30,
    maxLoginAttempts: 5,
  });

  const handleSave = async () => {
    setSaving(true);
    await adminSettingsApi.update(settings as any);
    setSaving(false);
  };

  return (
    <AdminLayout title="Settings" subtitle="Configure branch settings, roles, and system preferences">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full overflow-x-auto mb-4 h-auto flex-wrap">
          <TabsTrigger value="branch">Branch</TabsTrigger>
          <TabsTrigger value="dues">Dues & Thresholds</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>

        {/* Branch Settings */}
        <TabsContent value="branch">
          <AdminCard className="p-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-royal/10 flex items-center justify-center">
                <Building2 className="size-5 text-royal" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Branch Information</h3>
                <p className="text-xs text-muted-foreground">Official branch details and contact</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Branch Name</Label>
                <Input value={settings.branchName} onChange={(e) => setSettings({ ...settings, branchName: e.target.value })} className="h-10 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Address</Label>
                <Input value={settings.branchAddress} onChange={(e) => setSettings({ ...settings, branchAddress: e.target.value })} className="h-10 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Phone</Label>
                  <Input value={settings.branchPhone} onChange={(e) => setSettings({ ...settings, branchPhone: e.target.value })} className="h-10 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Email</Label>
                  <Input type="email" value={settings.branchEmail} onChange={(e) => setSettings({ ...settings, branchEmail: e.target.value })} className="h-10 rounded-xl" />
                </div>
              </div>
            </div>
            <Button className="w-full mt-5 bg-primary text-primary-foreground rounded-xl" onClick={handleSave} disabled={saving}>
              <Save className="size-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </AdminCard>
        </TabsContent>

        {/* Dues & Thresholds */}
        <TabsContent value="dues">
          <AdminCard className="p-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-gold/10 flex items-center justify-center">
                <CreditCard className="size-5 text-gold" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Dues & Compliance Thresholds</h3>
                <p className="text-xs text-muted-foreground">Configure financial and eligibility requirements</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Annual Dues Amount (₦)</Label>
                <Input type="number" value={settings.annualDuesAmount} onChange={(e) => setSettings({ ...settings, annualDuesAmount: Number(e.target.value) })} className="h-10 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold flex items-center gap-1.5"><CalendarCheck className="size-3" /> Attendance Threshold (%)</Label>
                  <Input type="number" value={settings.attendanceThreshold} onChange={(e) => setSettings({ ...settings, attendanceThreshold: Number(e.target.value) })} className="h-10 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold flex items-center gap-1.5"><Vote className="size-3" /> Voting Eligibility (%)</Label>
                  <Input type="number" value={settings.votingEligibilityThreshold} onChange={(e) => setSettings({ ...settings, votingEligibilityThreshold: Number(e.target.value) })} className="h-10 rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Good Standing Validity (months)</Label>
                <Input type="number" value={settings.goodStandingValidityMonths} onChange={(e) => setSettings({ ...settings, goodStandingValidityMonths: Number(e.target.value) })} className="h-10 rounded-xl" />
              </div>
            </div>
            <Button className="w-full mt-5 bg-primary text-primary-foreground rounded-xl" onClick={handleSave} disabled={saving}>
              <Save className="size-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </AdminCard>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <AdminCard className="p-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-royal/10 flex items-center justify-center">
                <Bell className="size-5 text-royal" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Notification Settings</h3>
                <p className="text-xs text-muted-foreground">Configure how members receive notifications</p>
              </div>
            </div>
            <div className="space-y-1">
              {[
                { key: "enableBiometricLogin", label: "Biometric Login", desc: "Allow fingerprint/Face ID login" },
                { key: "enableEmailNotifications", label: "Email Notifications", desc: "Send notifications via email" },
                { key: "enableSmsNotifications", label: "SMS Notifications", desc: "Send notifications via SMS" },
                { key: "enablePushNotifications", label: "Push Notifications", desc: "Send push notifications to mobile" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch
                    checked={(settings as any)[key]}
                    onCheckedChange={(v) => setSettings({ ...settings, [key]: v })}
                  />
                </div>
              ))}
            </div>
            <Button className="w-full mt-5 bg-primary text-primary-foreground rounded-xl" onClick={handleSave} disabled={saving}>
              <Save className="size-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </AdminCard>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <AdminCard className="p-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Lock className="size-5 text-destructive" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Security Settings</h3>
                <p className="text-xs text-muted-foreground">Configure session and authentication security</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Session Timeout (minutes)</Label>
                <Input type="number" value={settings.sessionTimeoutMinutes} onChange={(e) => setSettings({ ...settings, sessionTimeoutMinutes: Number(e.target.value) })} className="h-10 rounded-xl" />
                <p className="text-[11px] text-muted-foreground">Auto-logout after inactivity</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Max Login Attempts</Label>
                <Input type="number" value={settings.maxLoginAttempts} onChange={(e) => setSettings({ ...settings, maxLoginAttempts: Number(e.target.value) })} className="h-10 rounded-xl" />
                <p className="text-[11px] text-muted-foreground">Account lockout threshold</p>
              </div>
            </div>
            <Button className="w-full mt-5 bg-primary text-primary-foreground rounded-xl" onClick={handleSave} disabled={saving}>
              <Save className="size-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </AdminCard>
        </TabsContent>

        {/* Roles */}
        <TabsContent value="roles">
          <AdminCard className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Roles & Permissions</h3>
                  <p className="text-xs text-muted-foreground">Manage admin roles and access levels</p>
                </div>
              </div>
              <Button size="sm" className="rounded-xl bg-primary text-primary-foreground" onClick={() => adminRolesApi.create({ name: "New Role", description: "", permissions: [] })}>
                Add Role
              </Button>
            </div>
            <div className="space-y-3">
              {mockAdminRoles.map((role) => (
                <div key={role.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-foreground">{role.name}</h4>
                      <Badge variant="outline" className="text-xs">{role.memberCount} {role.memberCount === 1 ? "member" : "members"}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                    {role.permissions[0] !== "all" && role.permissions[0] !== "self.*" && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {role.permissions.map((perm) => (
                          <span key={perm} className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground">{perm}</span>
                        ))}
                      </div>
                    )}
                    {role.permissions[0] === "all" && (
                      <Badge variant="outline" className="text-xs mt-2 bg-gold/10 text-gold border-gold/30">Full Access</Badge>
                    )}
                  </div>
                  <Button size="sm" variant="ghost" className="rounded-xl shrink-0 ml-3">
                    <Settings className="size-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </AdminCard>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
