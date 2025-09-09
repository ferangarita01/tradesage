
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, PlusCircle, BrainCircuit, Trash2, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

type Strategy = {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
};

const initialStrategies: Strategy[] = [
  {
    id: "s1",
    name: "Scalping de Media Móvil",
    description: "Entrar en corto cuando el precio cruza por debajo de la EMA de 20 períodos y en largo cuando cruza por encima.",
    status: "active",
  },
  {
    id: "s2",
    name: "Swing Trading con RSI",
    description: "Comprar cuando el RSI cae por debajo de 30 (sobreventa) y vender cuando supera 70 (sobrecompra) en el gráfico de 4 horas.",
    status: "inactive",
  },
   {
    id: "s3",
    name: "Ruptura de Soportes/Resistencias",
    description: "Identificar niveles clave de soporte y resistencia. Operar en la dirección de la ruptura con alto volumen.",
    status: "inactive",
  },
];


export function StrategiesCard() {
    const [strategies, setStrategies] = React.useState<Strategy[]>(initialStrategies);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    const handleCreateStrategy = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;

        if (name && description) {
            const newStrategy: Strategy = {
                id: `s${strategies.length + 1}`,
                name,
                description,
                status: "inactive",
            };
            setStrategies(prev => [...prev, newStrategy]);
            setIsDialogOpen(false);
        }
    };
    
    const toggleStrategyStatus = (id: string) => {
        setStrategies(strategies.map(s => 
            s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s
        ));
    };

    const deleteStrategy = (id: string) => {
        setStrategies(strategies.filter(s => s.id !== id));
    };


    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                           <BrainCircuit className="w-6 h-6" /> 
                           Estrategias de Trading
                        </CardTitle>
                        <CardDescription>Define y gestiona tus estrategias de trading para automatizar análisis.</CardDescription>
                    </div>
                     <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                           <Button size="sm" variant="outline">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Nueva Estrategia
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[480px]">
                            <form onSubmit={handleCreateStrategy}>
                                <DialogHeader>
                                <DialogTitle>Crear Nueva Estrategia</DialogTitle>
                                <DialogDescription>
                                    Define una nueva regla o patrón para que CryptoSage lo identifique por ti.
                                </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid items-center gap-2">
                                        <Label htmlFor="name">Nombre de la Estrategia</Label>
                                        <Input id="name" name="name" placeholder="Ej: Cruce de Medias Móviles" required />
                                    </div>
                                    <div className="grid items-center gap-2">
                                        <Label htmlFor="description">Descripción</Label>
                                        <Textarea id="description" name="description" placeholder="Describe la lógica, indicadores y condiciones de tu estrategia." required className="min-h-[100px]" />
                                    </div>
                                </div>
                                <DialogFooter>
                                <Button type="submit">Guardar Estrategia</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-72">
                    <div className="space-y-4">
                        {strategies.map((strategy) => (
                            <div key={strategy.id} className="p-4 border rounded-lg flex items-start justify-between gap-4">
                                <div className="flex-shrink-0">
                                    <Lightbulb className={`w-5 h-5 mt-1 ${strategy.status === 'active' ? 'text-primary' : 'text-muted-foreground'}`} />
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-semibold text-foreground">{strategy.name}</h4>
                                        <Badge variant={strategy.status === 'active' ? 'default' : 'secondary'}>
                                            {strategy.status === 'active' ? 'Activa' : 'Inactiva'}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{strategy.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => toggleStrategyStatus(strategy.id)}
                                        title={strategy.status === 'active' ? 'Desactivar' : 'Activar'}
                                    >
                                        <Rocket className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => deleteStrategy(strategy.id)}
                                        title="Eliminar Estrategia"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {strategies.length === 0 && (
                             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-10">
                                <BrainCircuit className="w-12 h-12 mb-3" />
                                <p className="font-medium">No hay estrategias definidas</p>
                                <p className="text-xs">Crea tu primera estrategia para empezar.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
