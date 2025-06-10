import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BarChart3,
  Bot,
  ChevronRight,
  CreditCard,
  Globe,
  LineChart,
  Lock,
  MessageSquare,
  Rocket,
  Shield,
  Wallet,
  Zap,
} from "lucide-react";

import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import { Badge } from "@repo/ui/components/ui/badge";
import AuthController from "~/components/auth/auth-controller";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="py-4 border-b flex items-center justify-center">
        <span className="text-sm">Charts are powered by</span>
        <a
          href="https://tradingview.com"
          className="underline ml-2 text-blue-300"
          target="_blank"
        >
          TradingView
        </a>
      </div>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Dexion Pro</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link
              href="#features"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              How It Works
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              FAQ
            </Link>
          </nav>
          <AuthController />
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge
                    className="inline-flex rounded-md px-3.5 py-1.5"
                    variant="secondary"
                  >
                    Automated Trading Made Simple
                  </Badge>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Trade Smarter, Not Harder with TradeSphere
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    The all-in-one trading bot that manages your portfolio,
                    executes limit orders, and maximizes your profits with
                    advanced trading strategies.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="gap-1.5">
                    Start Trading Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline">
                    Watch Demo
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Secure Trading</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-primary" />
                    <span>Lightning Fast</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4 text-primary" />
                    <span>24/7 Support</span>
                  </div>
                </div>
              </div>
              <div className="relative flex items-center justify-center">
                <div className="relative h-[350px] w-full overflow-hidden rounded-xl border bg-background p-2 shadow-xl md:h-[420px]">
                  <Image
                    src="/placeholder.svg?height=420&width=600"
                    width={600}
                    height={420}
                    alt="Trading dashboard preview"
                    className="h-full w-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/20 rounded-lg" />
                  <div className="absolute bottom-4 left-4 right-4 grid gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-sm font-medium">BTC/USD</span>
                      </div>
                      <span className="text-sm font-medium">+3.45%</span>
                    </div>
                    <div className="h-10 bg-muted/50 rounded-md backdrop-blur" />
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
                <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-background"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge
                  className="inline-flex rounded-md px-3.5 py-1.5"
                  variant="secondary"
                >
                  Features
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Everything You Need to Trade
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  TradeSphere combines powerful trading tools with an intuitive
                  interface to give you the edge in any market.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 h-16 w-16 translate-x-1/2 -translate-y-1/2 bg-primary/10 rounded-full blur-2xl" />
                <CardHeader>
                  <Wallet className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Wallet Management</CardTitle>
                  <CardDescription>
                    Track all your assets in one place with real-time updates
                    and detailed analytics.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    <span className="text-sm">Multi-currency support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    <span className="text-sm">Portfolio visualization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    <span className="text-sm">Performance metrics</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 h-16 w-16 translate-x-1/2 -translate-y-1/2 bg-primary/10 rounded-full blur-2xl" />
                <CardHeader>
                  <BarChart3 className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Limit Orders</CardTitle>
                  <CardDescription>
                    Set precise entry and exit points with advanced limit order
                    capabilities.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    <span className="text-sm">Stop-loss automation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    <span className="text-sm">Take-profit targets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    <span className="text-sm">Trailing stops</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 h-16 w-16 translate-x-1/2 -translate-y-1/2 bg-primary/10 rounded-full blur-2xl" />
                <CardHeader>
                  <LineChart className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Advanced Trading</CardTitle>
                  <CardDescription>
                    Leverage sophisticated algorithms and strategies to maximize
                    your returns.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    <span className="text-sm">AI-powered insights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    <span className="text-sm">Custom strategy builder</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    <span className="text-sm">Backtesting tools</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 h-16 w-16 translate-x-1/2 -translate-y-1/2 bg-primary/10 rounded-full blur-2xl" />
                <CardHeader>
                  <CreditCard className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Referrals & Points</CardTitle>
                  <CardDescription>
                    Earn rewards by referring friends and accumulating points
                    through trading activity.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    <span className="text-sm">Tiered rewards system</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    <span className="text-sm">Redeemable benefits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    <span className="text-sm">Leaderboard competitions</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 h-16 w-16 translate-x-1/2 -translate-y-1/2 bg-primary/10 rounded-full blur-2xl" />
                <CardHeader>
                  <Bot className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Telegram Bot</CardTitle>
                  <CardDescription>
                    Control your trading activities on the go with our optional
                    Telegram integration.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    <span className="text-sm">Real-time alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    <span className="text-sm">Command-based trading</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    <span className="text-sm">Portfolio updates</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 h-16 w-16 translate-x-1/2 -translate-y-1/2 bg-primary/10 rounded-full blur-2xl" />
                <CardHeader>
                  <Lock className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Security First</CardTitle>
                  <CardDescription>
                    Your assets are protected with enterprise-grade security and
                    encryption.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    <span className="text-sm">Two-factor authentication</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    <span className="text-sm">API key management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    <span className="text-sm">Cold storage options</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="w-full py-12 md:py-24 lg:py-32 bg-muted"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge
                  className="inline-flex rounded-md px-3.5 py-1.5"
                  variant="secondary"
                >
                  How It Works
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Simple. Powerful. Effective.
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  TradeSphere makes automated trading accessible to everyone,
                  from beginners to professional traders.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="relative flex items-center justify-center">
                <div className="relative h-[350px] w-full overflow-hidden rounded-xl border bg-background p-2 shadow-xl md:h-[450px]">
                  <Image
                    src="/placeholder.svg?height=450&width=500"
                    width={500}
                    height={450}
                    alt="Trading interface"
                    className="h-full w-full object-cover rounded-lg"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
                <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
              </div>
              <div className="flex flex-col justify-center space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    1
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">Connect Your Accounts</h3>
                    <p className="text-muted-foreground">
                      Securely link your exchange accounts using API keys with
                      read-only or trading permissions.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    2
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">
                      Configure Your Strategy
                    </h3>
                    <p className="text-muted-foreground">
                      Choose from pre-built strategies or create your own custom
                      trading rules and parameters.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    3
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">Set Risk Parameters</h3>
                    <p className="text-muted-foreground">
                      Define your risk tolerance with stop-loss, take-profit,
                      and position sizing controls.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    4
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">Activate and Monitor</h3>
                    <p className="text-muted-foreground">
                      Launch your bot and track performance through our
                      dashboard or Telegram notifications.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge
                    className="inline-flex rounded-md px-3.5 py-1.5"
                    variant="secondary"
                  >
                    Testimonials
                  </Badge>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                    Trusted by Traders Worldwide
                  </h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Join thousands of satisfied traders who have transformed
                    their trading experience with TradeSphere.
                  </p>
                </div>
                <Tabs defaultValue="tab1" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="tab1">Individual</TabsTrigger>
                    <TabsTrigger value="tab2">Professional</TabsTrigger>
                    <TabsTrigger value="tab3">Institutional</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tab1" className="space-y-4 pt-4">
                    <div className="rounded-lg border bg-background p-6">
                      <div className="flex items-start gap-4">
                        <div className="rounded-full bg-primary/10 p-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            "TradeSphere has completely changed how I approach
                            trading. The automated strategies have consistently
                            outperformed my manual trading, and the interface is
                            incredibly intuitive."
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-muted" />
                            <div>
                              <p className="text-sm font-medium">
                                Alex Thompson
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Day Trader
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="tab2" className="space-y-4 pt-4">
                    <div className="rounded-lg border bg-background p-6">
                      <div className="flex items-start gap-4">
                        <div className="rounded-full bg-primary/10 p-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            "As a professional trader, I need tools that can
                            keep up with market volatility. TradeSphere's
                            advanced order types and strategy builder give me
                            the edge I need in today's markets."
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-muted" />
                            <div>
                              <p className="text-sm font-medium">Sarah Chen</p>
                              <p className="text-xs text-muted-foreground">
                                Professional Trader
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="tab3" className="space-y-4 pt-4">
                    <div className="rounded-lg border bg-background p-6">
                      <div className="flex items-start gap-4">
                        <div className="rounded-full bg-primary/10 p-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            "We've integrated TradeSphere into our trading desk
                            operations, and the results have been outstanding.
                            The API access and custom strategy development have
                            allowed us to tailor the platform to our specific
                            needs."
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-muted" />
                            <div>
                              <p className="text-sm font-medium">
                                Michael Rodriguez
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Hedge Fund Manager
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              <div className="relative flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-4">
                    <div className="overflow-hidden rounded-lg">
                      <Image
                        src="/placeholder.svg?height=200&width=200"
                        width={200}
                        height={200}
                        alt="Testimonial"
                        className="h-auto w-full object-cover transition-all hover:scale-105"
                      />
                    </div>
                    <div className="overflow-hidden rounded-lg">
                      <Image
                        src="/placeholder.svg?height=200&width=200"
                        width={200}
                        height={200}
                        alt="Testimonial"
                        className="h-auto w-full object-cover transition-all hover:scale-105"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4">
                    <div className="overflow-hidden rounded-lg">
                      <Image
                        src="/placeholder.svg?height=200&width=200"
                        width={200}
                        height={200}
                        alt="Testimonial"
                        className="h-auto w-full object-cover transition-all hover:scale-105"
                      />
                    </div>
                    <div className="overflow-hidden rounded-lg">
                      <Image
                        src="/placeholder.svg?height=200&width=200"
                        width={200}
                        height={200}
                        alt="Testimonial"
                        className="h-auto w-full object-cover transition-all hover:scale-105"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="faq"
          className="w-full py-12 md:py-24 lg:py-32 bg-background"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge
                  className="inline-flex rounded-md px-3.5 py-1.5"
                  variant="secondary"
                >
                  FAQ
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Frequently Asked Questions
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to know about TradeSphere and automated
                  trading.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Is my money safe with TradeSphere?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    TradeSphere never holds your funds. We connect to your
                    exchange accounts using API keys, which can be configured
                    with trading-only permissions and no withdrawal access.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Which exchanges are supported?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We support all major cryptocurrency exchanges including
                    Binance, Coinbase Pro, Kraken, FTX, and many more. We're
                    constantly adding new integrations.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>
                    Do I need trading experience to use TradeSphere?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    While trading experience is helpful, TradeSphere is designed
                    to be accessible to beginners. We offer pre-built strategies
                    and comprehensive tutorials to help you get started.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>How does the referral system work?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    When you refer a friend, you both receive points that can be
                    redeemed for subscription discounts, premium features, or
                    even converted to trading credit. The more active users you
                    refer, the higher your rewards.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>
                    Can I use TradeSphere for stock trading?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Currently, TradeSphere focuses on cryptocurrency markets.
                    However, we're developing integrations with stock brokerages
                    and plan to launch stock trading capabilities in the near
                    future.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>
                    What if I need to cancel my subscription?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    You can cancel your subscription at any time from your
                    account settings. We offer a 14-day money-back guarantee for
                    new subscribers if you're not satisfied with our service.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge
                  className="inline-flex rounded-md px-3.5 py-1.5"
                  variant="secondary"
                >
                  Get Started
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Ready to Transform Your Trading?
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of traders who are already using TradeSphere to
                  automate their trading and maximize profits.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" className="gap-1.5">
                  Start Your Free Trial
                  <Rocket className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  Schedule a Demo
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-background">
        <div className="container flex flex-col items-center justify-center gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">TradeSphere</span>
          </div>
          <nav className="flex gap-4 md:gap-6">
            <Link
              href="#"
              className="text-xs hover:underline underline-offset-4"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-xs hover:underline underline-offset-4"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-xs hover:underline underline-offset-4"
            >
              Cookies
            </Link>
          </nav>
          <div className="md:ml-auto flex gap-4">
            <Link
              href="#"
              className="text-xs hover:underline underline-offset-4"
            >
              © {new Date().getFullYear()} TradeSphere. All rights reserved.
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
