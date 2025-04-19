import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Progress } from "@repo/ui/components/ui/progress";

export default function Performance() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="text-sm font-medium">Performance</span>
          <button className="rounded-full p-1 hover:bg-muted">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-xs text-muted-foreground">Total PNL</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-muted">
                  <svg
                    className="h-4 w-4 text-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2L15 8L21 9L16.5 14L18 20L12 17L6 20L7.5 14L3 9L9 8L12 2Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <span className="font-medium">0.157</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-muted">
                  <svg
                    className="h-4 w-4 text-destructive"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2L15 8L21 9L16.5 14L18 20L12 17L6 20L7.5 14L3 9L9 8L12 2Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <span className="font-medium text-destructive">-0.016</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">Total TXNS</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">Balance</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">PNL</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>+500%</span>
              <span>0</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>200% - 500%</span>
              <span>17</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>0% - 200%</span>
              <span>34</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>0% - -50%</span>
              <span>16</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>{"< -50%"}</span>
              <span></span>
            </div>

            <Progress
              value={75}
              className="h-1.5 bg-muted"
              indicatorClassName="bg-gradient-to-r from-green-500 to-red-500"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
