import React, { useRef } from 'react';
import type { TimetableSlot } from '../../store/timetableStore';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface TimetableGridProps {
  slots: TimetableSlot[];
  className?: string;
  classNameLabel?: string; // New prop for the class name (e.g. ING-INFO1-A)
  programName?: string;
  level?: number;
  semester?: string;
  academicYear?: string;
}

const DAYS = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
const TIME_SLOTS = [
  { start: '08:30', end: '10:00', label: '8H30 à 10H' },
  { start: '10:30', end: '12:00', label: '10H30 à 12H' },
  { start: '14:30', end: '16:00', label: '14H30 à 16H' },
  { start: '16:30', end: '18:00', label: '16H30 à 18H' },
];

// Color palette for different courses – deterministic by courseId
const COURSE_COLORS = [
  { bg: 'bg-sky-50',    border: 'border-sky-200',    text: 'text-sky-900',    profText: 'text-sky-700',    roomBg: 'bg-sky-100',    roomText: 'text-sky-600' },
  { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-900', profText: 'text-violet-700', roomBg: 'bg-violet-100', roomText: 'text-violet-600' },
  { bg: 'bg-emerald-50',border: 'border-emerald-200',text: 'text-emerald-900',profText: 'text-emerald-700',roomBg: 'bg-emerald-100',roomText: 'text-emerald-600' },
  { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-900',  profText: 'text-amber-700',  roomBg: 'bg-amber-100',  roomText: 'text-amber-600' },
  { bg: 'bg-rose-50',   border: 'border-rose-200',   text: 'text-rose-900',   profText: 'text-rose-700',   roomBg: 'bg-rose-100',   roomText: 'text-rose-600' },
  { bg: 'bg-upf-primaryLight/10',   border: 'border-cyan-200',   text: 'text-cyan-900',   profText: 'text-cyan-700',   roomBg: 'bg-upf-primaryLight/20',   roomText: 'text-upf-primaryLight' },
  { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', profText: 'text-orange-700', roomBg: 'bg-orange-100', roomText: 'text-orange-600' },
  { bg: 'bg-upf-primary/10', border: 'border-upf-primary/30', text: 'text-upf-primary', profText: 'text-upf-primary', roomBg: 'bg-upf-primary/20', roomText: 'text-upf-primary' },
];

const TimetableGrid: React.FC<TimetableGridProps> = ({ 
  slots = [], 
  classNameLabel,
  programName, 
  level, 
  semester, 
  academicYear 
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = React.useState(false);

  // Build a map of courseId -> color index for consistent coloring
  const courseColorMap = React.useMemo(() => {
    const uniqueCourseIds = [...new Set(slots.map(s => s.courseId))];
    const map: Record<string, number> = {};
    uniqueCourseIds.forEach((id, i) => {
      map[id] = i % COURSE_COLORS.length;
    });
    return map;
  }, [slots]);

  const getSlotContent = (day: string, time: string) => {
    if (!Array.isArray(slots)) return null;
    return slots.find(s => s.dayOfWeek === day && s.startTime === time);
  };

  // Check if this slot is a continuation of the previous slot (same course, consecutive time)
  const isConsecutive = (day: string, timeIndex: number): boolean => {
    if (timeIndex === 0 || timeIndex === 2) return false; // Can't be continuation at start of morning/afternoon
    const currentSlot = getSlotContent(day, TIME_SLOTS[timeIndex].start);
    const prevSlot = getSlotContent(day, TIME_SLOTS[timeIndex - 1].start);
    if (!currentSlot || !prevSlot) return false;
    return currentSlot.courseId === prevSlot.courseId;
  };

  const downloadPdf = async () => {
    if (!gridRef.current) return;
    setIsExporting(true);
    
    try {
      // Small delay for stability
      await new Promise(resolve => setTimeout(resolve, 200));

      const canvas = await html2canvas(gridRef.current, {
        scale: 3, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Standard A4 dimensions in mm
      const A4_WIDTH = 297;
      const A4_HEIGHT = 210;
      const MARGIN = 15; // 15mm margin
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgProps = pdf.getImageProperties(imgData);
      
      // Calculate available space
      const availableWidth = A4_WIDTH - (MARGIN * 2);
      const availableHeight = A4_HEIGHT - (MARGIN * 2);
      
      // Calculate scale to fit while maintaining aspect ratio
      const widthScale = availableWidth / imgProps.width;
      const heightScale = availableHeight / imgProps.height;
      const scale = Math.min(widthScale, heightScale); // Use the most restrictive scale
      
      const finalWidth = imgProps.width * scale;
      const finalHeight = imgProps.height * scale;
      
      // Center horizontally and vertically
      const x = (A4_WIDTH - finalWidth) / 2;
      const y = (A4_HEIGHT - finalHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight, undefined, 'FAST');
      
      const filename = `Emploi_${classNameLabel || programName || 'Classe'}_${semester || ''}_${academicYear || ''}.pdf`.replace(/\s+/g, '_');
      pdf.save(filename);
    } catch (error) {
      console.error('PDF Export Error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const hasContent = slots.length > 0;

  return (
    <div className="space-y-4">
      {/* Export Controls */}
      {hasContent && (
        <div className="flex justify-end">
          <button
            onClick={downloadPdf}
            disabled={isExporting}
            className="group flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {isExporting ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <ArrowDownTrayIcon className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            )}
            TÉLÉCHARGER PDF
          </button>
        </div>
      )}

      <div ref={gridRef} className="space-y-0 bg-white">
        {/* Document-Style Header */}
        {hasContent && (programName || academicYear) && (
          <div className="bg-white border border-slate-200 border-b-0 rounded-t-2xl px-8 py-6">
            <h2 className="text-center text-2xl font-black text-slate-800 tracking-tight mb-4 font-outfit uppercase">
              Emploi du temps {academicYear || ''}
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-slate-600">
              {classNameLabel && (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Classe :</span> 
                  <span className="font-black text-upf-primary text-base">{classNameLabel}</span>
                </div>
              )}
              {level && (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Niveau :</span> 
                  <span className="font-bold text-slate-800">{level}ᵉ Année</span>
                </div>
              )}
              {programName && (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Filière :</span> 
                  <span className="font-bold text-slate-800">{programName}</span>
                </div>
              )}
              {semester && (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Semestre :</span> 
                  <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{semester}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timetable Table */}
        <div className={`overflow-x-auto bg-white shadow-xl shadow-slate-200/50 border border-slate-200 ${hasContent && (programName || academicYear) ? 'rounded-b-2xl' : 'rounded-2xl'}`}>
          <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th className="p-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white text-xs font-black uppercase tracking-widest border border-sky-400/50 w-[120px]">
                  Jours
                </th>
                {TIME_SLOTS.map(slot => (
                  <th key={slot.start} className="p-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white text-xs font-black uppercase tracking-wider border border-sky-400/50">
                    {slot.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day, dayIndex) => {
                // Check if there's any content on this day
                const dayHasContent = TIME_SLOTS.some(t => getSlotContent(day, t.start));

                return (
                  <tr 
                    key={day} 
                    className={`
                      ${dayIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                      hover:bg-sky-50/30 transition-colors duration-150
                    `}
                  >
                    {/* Day Name */}
                    <td className="p-3 border border-slate-200 bg-slate-50 font-black text-slate-700 text-sm tracking-wide text-center align-middle">
                      {day}
                    </td>

                    {/* Time Slots */}
                    {TIME_SLOTS.map((time, timeIndex) => {
                      const slot = getSlotContent(day, time.start);
                      const consecutive = isConsecutive(day, timeIndex);
                      const colors = slot ? COURSE_COLORS[courseColorMap[slot.courseId] ?? 0] : null;

                      return (
                        <td 
                          key={`${day}-${time.start}`} 
                          className={`border border-slate-200 p-1.5 align-middle ${!dayHasContent ? 'h-16' : 'h-24'}`}
                        >
                          {slot ? (
                            <div className={`
                              h-full flex flex-col justify-center items-center text-center 
                              px-2 py-2
                              ${colors!.bg} ${colors!.border} border
                              ${consecutive ? 'rounded-r-xl rounded-l-none border-l-0' : 'rounded-xl'}
                              transition-all duration-200 hover:shadow-md hover:scale-[1.02]
                            `}>
                              {/* Course Name */}
                              <div className={`text-[13px] font-black leading-tight mb-1.5 ${colors!.text}`}>
                                {slot.course?.name || 'Cours Inconnu'}
                              </div>

                              {/* Professor */}
                              <div className={`text-[11px] font-semibold ${colors!.profText} mb-1`}>
                                Pr. {slot.course?.professor 
                                  ? `${slot.course.professor.lastName?.toUpperCase()} ${slot.course.professor.firstName || ''}`
                                  : 'TBD'}
                              </div>

                              {/* Room */}
                              <div className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${colors!.roomBg} ${colors!.roomText}`}>
                                {slot.room?.startsWith('Salle') || slot.room?.startsWith('Amphi') || slot.room?.startsWith('Labo') 
                                  ? slot.room 
                                  : `Salle ${slot.room}`}
                              </div>
                            </div>
                          ) : (
                            <div className="h-full rounded-lg" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimetableGrid;


