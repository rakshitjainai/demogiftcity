import React from 'react';
import { ArrowRight, Bell, Calendar, User, Clock, ChevronRight, Sparkles, BookOpen, FileCheck, Award, Layers, ShieldCheck } from 'lucide-react';
import { LATEST_UPDATES, LATEST_BLOGS, LEARNING_MODULES } from '../data/mockData';

const iconMap = {
  FileCheck,
  Award,
  Layers,
  ShieldCheck
};

export default function ContentGrid({ onSelectArticle, onSelectUpdate, onSelectModule }) {
  return (
    <section className="py-12 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Latest Updates */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-emerald-50 text-reg-green">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Latest Updates</h3>
                    <p className="text-[11px] text-slate-500">Circulars, Amendments & Orders</p>
                  </div>
                </div>
                <button
                  onClick={() => onSelectUpdate && onSelectUpdate(LATEST_UPDATES[0])}
                  className="text-xs font-bold text-reg-green hover:underline flex items-center space-x-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Updates List Rows */}
              <div className="divide-y divide-slate-100 mt-4">
                {LATEST_UPDATES.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectUpdate && onSelectUpdate(item)}
                    className="py-3.5 first:pt-0 last:pb-0 hover:bg-slate-50/80 rounded-xl px-2 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase border ${item.tagColor}`}>
                        {item.type}
                      </span>
                      <div className="flex items-center space-x-2">
                        {item.isNew && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 bg-emerald-600 text-white rounded animate-pulse">
                            NEW
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-slate-400">
                          {item.date}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-reg-green transition-colors leading-snug">
                      {item.title}
                    </h4>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Accent Banner */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-900 to-slate-900 text-white text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-medium">Get instant notification alerts via RSS or Email</span>
              </div>
            </div>
          </div>

          {/* Column 2: Latest Blogs / Articles */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Latest Articles & Blogs</h3>
                    <p className="text-[11px] text-slate-500">Insights by CS Prashant Kumar</p>
                  </div>
                </div>
                <button
                  onClick={() => onSelectArticle && onSelectArticle(LATEST_BLOGS[0])}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center space-x-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Blog Post List */}
              <div className="space-y-4 mt-4">
                {LATEST_BLOGS.map((blog) => {
                  const IconComp = iconMap[blog.iconName] || BookOpen;
                  return (
                    <div
                      key={blog.id}
                      onClick={() => onSelectArticle && onSelectArticle(blog)}
                      className="flex items-start space-x-3 p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer group"
                    >
                      {/* Generated Abstract Thumbnail Card */}
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${blog.imageBg} text-white flex flex-col items-center justify-center p-2 flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform`}>
                        <IconComp className="w-6 h-6 text-emerald-300 mb-0.5" />
                        <span className="text-[9px] font-black uppercase tracking-tight text-white/80 line-clamp-1">
                          {blog.category.split(' ')[0]}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-reg-green transition-colors leading-snug line-clamp-2">
                          {blog.title}
                        </h4>
                        
                        <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-medium">
                          <span className="flex items-center space-x-1 text-slate-700">
                            <User className="w-3 h-3 text-slate-400" />
                            <span className="font-semibold">{blog.author}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{blog.readTime}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 3: Popular Learning Modules */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Popular Learning Modules</h3>
                    <p className="text-[11px] text-slate-500">Interactive Drills & Certification</p>
                  </div>
                </div>
              </div>

              {/* Module Cards */}
              <div className="space-y-4 mt-4">
                {LEARNING_MODULES.map((mod) => (
                  <div
                    key={mod.id}
                    onClick={() => onSelectModule && onSelectModule(mod)}
                    className={`rounded-2xl p-4 border shadow-sm ${mod.color} transition-all hover:scale-[1.02] cursor-pointer relative overflow-hidden group`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-white/10 border border-white/20 uppercase tracking-wide">
                          {mod.code}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-400 text-slate-950 rounded-full">
                          {mod.badge}
                        </span>
                      </div>

                      {/* Circular > Action Button */}
                      <button className="w-8 h-8 rounded-full bg-white/20 group-hover:bg-white text-white group-hover:text-slate-950 flex items-center justify-center transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="text-xs sm:text-sm font-extrabold mb-3 leading-snug text-white">
                      {mod.title}
                    </h4>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-white/80">
                        <span>{mod.completedLessons}/{mod.lessons} Lessons</span>
                        <span className="font-bold text-white">{mod.progress}% Complete</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
                        <div
                          className={`h-full ${mod.accentBg} transition-all duration-500 rounded-full`}
                          style={{ width: `${mod.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
