import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";

export default function BalanceSection() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-xs text-muted-foreground">Total Balance</div>
            <div className="text-2xl font-bold">$21.01</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Unrealized PNL</div>
            <div className="text-lg">$0</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">
              Available Balance
            </div>
            <div className="text-lg">$21.01</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
