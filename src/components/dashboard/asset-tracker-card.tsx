import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { BitcoinIcon, EthereumIcon } from "@/components/icons";
import { Line, LineChart } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";

const assets = [
  {
    icon: <BitcoinIcon className="w-8 h-8" />,
    name: "Bitcoin",
    symbol: "BTC",
    price: "$68,420.10",
    change: "+1.25%",
    changeType: "positive",
    data: [
      { value: 45 }, { value: 48 }, { value: 50 }, { value: 43 },
      { value: 55 }, { value: 60 }, { value: 58 }, { value: 62 },
    ],
  },
  {
    icon: <EthereumIcon className="w-8 h-8" />,
    name: "Ethereum",
    symbol: "ETH",
    price: "$3,550.60",
    change: "-0.45%",
    changeType: "negative",
    data: [
      { value: 65 }, { value: 60 }, { value: 58 }, { value: 62 },
      { value: 55 }, { value: 58 }, { value: 55 }, { value: 50 },
    ],
  },
    {
    icon: <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">AAPL</div>,
    name: "Apple Inc.",
    symbol: "AAPL",
    price: "$214.29",
    change: "+2.19%",
    changeType: "positive",
    data: [
      { value: 20 }, { value: 25 }, { value: 22 }, { value: 30 },
      { value: 35 }, { value: 38 }, { value: 42 }, { value: 40 },
    ],
  },
];

export function AssetTrackerCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>My Portfolio</CardTitle>
        <CardDescription>A quick look at your tracked assets.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.symbol}>
                <TableCell className="p-2">
                    {asset.icon}
                </TableCell>
                <TableCell className="p-2 font-medium">
                  <div>{asset.name}</div>
                  <div className="text-xs text-muted-foreground">{asset.symbol}</div>
                </TableCell>
                <TableCell className="p-2 w-[80px] h-[40px]">
                  <ChartContainer config={{}} className="w-full h-full">
                    <LineChart
                      accessibilityLayer
                      data={asset.data}
                      margin={{ top: 5, bottom: 5, left: 5, right: 5 }}
                    >
                      <Line
                        dataKey="value"
                        type="monotone"
                        stroke={asset.changeType === 'positive' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ChartContainer>
                </TableCell>
                <TableCell className="p-2 text-right">
                  <div>{asset.price}</div>
                  <Badge variant="outline" className={`text-xs ${asset.changeType === 'positive' ? 'text-green-500 border-green-500/50' : 'text-red-500 border-red-500/50'}`}>{asset.change}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
