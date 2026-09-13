import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useInstitution } from "../../context/InstitutionContext";
import EventCard from "../../components/events/EventCard";
import { Search, Filter, Calendar, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

export default function EventsDirectory() {
  const { institution, categories } = useInstitution();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [timeframe, setTimeframe] = useState("all"); // 'all', 'upcoming', 'past'
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, pages: 1 });

  const fetchEvents = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", 9);
      if (search.trim()) params.append("search", search.trim());
      if (selectedCategory && selectedCategory !== "all") params.append("category", selectedCategory);
      if (timeframe && timeframe !== "all") params.append("timeframe", timeframe);

      const res = await api.get(`/events?${params.toString()}`);
      if (res.success) {
        setEvents(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchEvents(1);
    }, 300);
    return () => clearTimeout(debounce);
  }, [search, selectedCategory, timeframe]);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center sm:text-left space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{institution.name} Event Calendar</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Explore Campus Events & Competitions
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Register for technical symposiums, hackathons, sports tournaments, and cultural performances hosted at {institution.name}.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* Search */}
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search event title, venue, topic, or description..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-900 transition-colors"
              />
            </div>

            {/* Timeframe selector */}
            <div className="sm:col-span-4 flex items-center bg-slate-100 p-1 rounded-2xl">
              {["all", "upcoming", "past"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeframe(t)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    timeframe === t
                      ? "bg-white text-blue-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? "bg-blue-900 text-white border-blue-900 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-white border border-slate-200 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No events matched your criteria</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or selecting a different category filter.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
                setTimeframe("all");
              }}
              className="px-4 py-2 text-xs font-bold text-blue-900 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt) => (
              <EventCard key={evt._id} event={evt} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              onClick={() => fetchEvents(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <span className="px-4 py-2 text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 rounded-xl">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => fetchEvents(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
