"use client";

import { Card } from "@/components/ui/card";
import { VisitReport } from "../lib/types";
import {
  Calendar,
  Clock,
  Star,
  MessageSquare,
  Package,
  FileText,
  Stethoscope,
} from "lucide-react";

interface VisitReportsListProps {
  reports: VisitReport[];
  page?: number;
  limit?: number;
  totalCount?: number;
}

const getRatingStars = (rating: string) => {
  const ratingNum = parseInt(rating);
  return "⭐".repeat(ratingNum);
};

const getRatingColor = (rating: string) => {
  const ratingNum = parseInt(rating);
  if (ratingNum >= 4) return "text-dashboard-green";
  if (ratingNum >= 3) return "text-dashboard-orange";
  return "text-dashboard-red";
};

import Pagination from "@/components/ui/Pagination";

export default function VisitReportsList({ reports, page = 1, limit = 10, totalCount = 0 }: VisitReportsListProps) {
  if (reports.length === 0) {
    return (
      <Card className="border-secondary-light flex flex-col items-center justify-center rounded-[25px] border bg-white p-12 shadow-none">
        <FileText className="text-secondary-light mb-4 h-16 w-16" />
        <h3 className="mb-2 text-lg font-medium text-black">
          No reports found
        </h3>
        <p className="text-secondary-dark text-sm">
          Visit reports will appear here once medical reps submit them
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4"> 

      {typeof totalCount === "number" && (
        <div className="mt-4">
          <Pagination page={page} limit={limit} totalCount={totalCount} />
        </div>
      )}


      {reports.map((report) => (

        
        <Card
          key={report.id}
          className="border-secondary-light rounded-[25px] border bg-white p-6 shadow-none transition-all hover:shadow-md"
        >

          
          <div className="space-y-4">
            {/* Header with Doctor Info */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="gradient-blue flex h-12 w-12 items-center justify-center rounded-[10px]">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <div>
                  {/* <h3 className="text-base font-medium text-black">
                    {report.doctorNameAR} - {report.doctorNameEN}
                  </h3> */}
                  <p className="text-secondary-dark text-sm">
                    Visit ID: {report.visitId}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Star
                    className={`h-4 w-4 ${getRatingColor(report.rating)}`}
                  />
                  <span
                    className={`text-sm font-medium ${getRatingColor(report.rating)}`}
                  >
                    {getRatingStars(report.rating)} ({report.rating}/5)
                  </span>
                </div>
                <p className="text-secondary-dark mt-1 text-xs">
                  {report.createdAt}
                </p>
              </div>
            </div>

            {/* Visit Details Grid */}
            <div className="border-secondary-light bg-secondary-very-light grid grid-cols-3 gap-4 rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Calendar className="text-dashboard-blue h-4 w-4" />
                <div>
                  <p className="text-secondary-dark text-xs">Visit Date</p>
                  <p className="text-sm font-medium text-black">
                    {report.visitDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="text-dashboard-green h-4 w-4" />
                <div>
                  <p className="text-secondary-dark text-xs">Duration</p>
                  <p className="text-sm font-medium text-black">
                    {report.duration}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="text-dashboard-orange h-4 w-4" />
                <div>
                  <p className="text-secondary-dark text-xs">
                    Samples Provided
                  </p>
                  <p className="text-sm font-medium text-black">
                    {report.samplesProvided.length} items
                  </p>
                </div>
              </div>
            </div>

            {/* Visit Purpose */}
            {report.visitPurpose && (
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-black">
                  <FileText className="h-4 w-4" />
                  Visit Purpose
                </h4>
                <p className="text-secondary-dark bg-secondary-very-light rounded-lg p-3 text-sm">
                  {report.visitPurpose}
                </p>
              </div>
            )}

            {/* Discussed Topics */}
            {report.discussedTopics.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-black">
                  Discussed Topics
                </h4>
                <div className="flex flex-wrap gap-2">
                  {report.discussedTopics.map((topic, index) => (
                    <span
                      key={index}
                      className="bg-dashboard-blue rounded-md px-2 py-1 text-xs text-white"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Doctor Feedback */}
            {report.doctorFeedback && (
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-black">
                  <MessageSquare className="h-4 w-4" />
                  Doctor&apos;s Feedback
                </h4>
                <p className="text-secondary-dark bg-secondary-very-light rounded-lg p-3 text-sm">
                  {report.doctorFeedback}
                </p>
              </div>
            )}

            {/* Samples Provided */}
            {report.samplesProvided.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-black">
                  <Package className="h-4 w-4" />
                  Samples Provided
                </h4>
                <div className="flex flex-wrap gap-2">
                  {report.samplesProvided.map((sample, index) => (
                    <span
                      key={index}
                      className="bg-dashboard-green rounded-md px-2 py-1 text-xs text-white"
                    >
                      {sample}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {report.notes && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-black">
                  Additional Notes
                </h4>
                <p className="text-secondary-dark bg-secondary-very-light rounded-lg p-3 text-sm">
                  {report.notes}
                </p>
              </div>
            )}
          </div>
        </Card>
      ))}
   



      </div>
      
  );
}
