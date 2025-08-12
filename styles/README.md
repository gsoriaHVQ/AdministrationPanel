# Sistema de Estilos Modular

Este directorio contiene un sistema de estilos modular y reutilizable para la aplicación de agendas médicas.

## Estructura

```
styles/
├── theme.ts          # Configuración del tema (colores, tipografía, espaciados)
├── common.ts         # Estilos específicos de componentes
├── utils.ts          # Utilidades para combinar clases CSS
└── index.ts          # Exportaciones principales
```

## Uso

### 1. Importar estilos

```typescript
import { componentStyles, cn, theme } from '@/styles'
```

### 2. Usar estilos de componentes

```typescript
// En lugar de clases inline
<div className="text-2xl font-bold text-[#8B1538]">Título</div>

// Usar estilos modulares
<div className={componentStyles.doctorsList.title}>Título</div>
```

### 3. Combinar clases con utilidades

```typescript
import { cn } from '@/styles'

// Combinar clases de manera inteligente
<div className={cn(
  "base-class",
  isActive ? "active-class" : "inactive-class"
)}>
  Contenido
</div>
```

## Componentes Reutilizables

### WeekDaySelector
Selector de días de la semana con estilos consistentes.

```typescript
import { WeekDaySelector } from '@/components/ui/week-day-selector'

<WeekDaySelector
  selectedDays={[0, 1, 2]} // Lunes, Martes, Miércoles
  onDayToggle={(dayIndex) => handleDayToggle(dayIndex)}
/>
```

### TimeRangeSelector
Selector de rango de tiempo con inputs de inicio y fin.

```typescript
import { TimeRangeSelector } from '@/components/ui/time-range-selector'

<TimeRangeSelector
  startTime="09:00"
  endTime="17:00"
  onStartTimeChange={(time) => setStartTime(time)}
  onEndTimeChange={(time) => setEndTime(time)}
  startLabel="Hora inicio"
  endLabel="Hora fin"
  required
/>
```

### DoctorCard
Tarjeta reutilizable para mostrar información de médicos.

```typescript
import { DoctorCard } from '@/components/doctors/doctor-card'

<DoctorCard
  doctor={doctor}
  onViewSchedule={(doctorId) => handleViewSchedule(doctorId)}
/>
```

## Principios de Diseño

### 1. Separación de Responsabilidades
- **theme.ts**: Define la configuración del tema
- **common.ts**: Define estilos específicos de componentes
- **utils.ts**: Proporciona utilidades para combinar estilos

### 2. Reutilización
- Los estilos se definen una vez y se reutilizan en múltiples componentes
- Los componentes reutilizables encapsulan lógica y estilos comunes

### 3. Consistencia
- Uso de colores del tema en lugar de valores hardcodeados
- Espaciados y tipografía consistentes
- Nomenclatura clara y descriptiva

### 4. Mantenibilidad
- Cambios en el tema se reflejan automáticamente en toda la aplicación
- Fácil modificación de estilos sin afectar la lógica de componentes

## Beneficios

1. **Consistencia Visual**: Todos los componentes usan la misma paleta de colores y espaciados
2. **Mantenibilidad**: Cambios en el tema se aplican globalmente
3. **Reutilización**: Componentes y estilos se pueden reutilizar fácilmente
4. **Legibilidad**: Código más limpio y fácil de entender
5. **Escalabilidad**: Fácil agregar nuevos estilos y componentes

## Convenciones de Nomenclatura

- **componentStyles**: Estilos específicos de componentes
- **theme**: Configuración del tema
- **cn**: Función para combinar clases CSS

## Ejemplos de Uso

### Antes (con clases inline)
```typescript
<div className="text-2xl font-bold text-[#8B1538] mb-4">
  Gestión de Médicos
</div>
```

### Después (con estilos modulares)
```typescript
<div className={componentStyles.doctorsList.title}>
  Gestión de Médicos
</div>
```

### Antes (con lógica duplicada)
```typescript
{["Lun", "Mar", "Mié"].map((day, index) => (
  <div className={`border-2 rounded-lg p-3 ${
    selectedDays.includes(index) 
      ? "border-[#8B1538] bg-[#8B1538] text-white"
      : "border-gray-200 bg-white text-gray-700"
  }`}>
    {day}
  </div>
))}
```

### Después (con componente reutilizable)
```typescript
<WeekDaySelector
  selectedDays={selectedDays}
  onDayToggle={handleDayToggle}
/>
``` 