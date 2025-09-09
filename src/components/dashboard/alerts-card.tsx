"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BellPlus, Bell, ArrowUp, ArrowDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

const alerts = [
    { asset: "Bitcoin", condition: "rises above", value: "$70,000" },
    { asset: "Ethereum", condition: "drops below", value: "$3,400" }
];

export function AlertsCard() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle>Price Alerts</CardTitle>
                        <CardDescription>Notifications for market movements</CardDescription>
                    </div>
                     <Dialog>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                                <BellPlus className="mr-2 h-4 w-4" />
                                Create Alert
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                            <DialogTitle>Create New Alert</DialogTitle>
                            <DialogDescription>
                                Get notified when an asset reaches your target price.
                            </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="asset" className="text-right">Asset</Label>
                                    <Select>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select an asset" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BTCUSDT">Bitcoin (BTC)</SelectItem>
                                            <SelectItem value="ETHUSDT">Ethereum (ETH)</SelectItem>
                                            <SelectItem value="ADAUSDT">Cardano (ADA)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="condition" className="text-right">Condition</Label>
                                     <Select>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select a condition" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="above">Rises Above</SelectItem>
                                            <SelectItem value="below">Drops Below</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="price" className="text-right">Price (USD)</Label>
                                    <Input id="price" type="number" placeholder="e.g., 70000" className="col-span-3" />
                                </div>
                            </div>
                            <DialogFooter>
                            <Button type="submit">Save Alert</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-48">
                    <div className="space-y-4">
                        {alerts.map((alert, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Bell className="w-4 h-4 text-muted-foreground" />
                                        <span className="font-medium text-foreground">{alert.asset}</span>
                                    </div>
                                    <span className="font-semibold text-primary">{alert.value}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground ml-6">
                                    {alert.condition.includes("above") ? 
                                        <ArrowUp className="w-3 h-3 text-green-500" /> : 
                                        <ArrowDown className="w-3 h-3 text-red-500" />
                                    }
                                    <span>{alert.condition}</span>
                                </div>
                                {index < alerts.length - 1 && <Separator className="pt-2"/>}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}