import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Share2, Bookmark } from 'lucide-react';
import DOMPurify from 'dompurify';
import { LATEST_BLOGS, LATEST_UPDATES } from '../data/mockData';

export default function Article() {
  const { slug } = useParams();
  
  // Try to find the article by id from the slug
  const id = slug?.replace('article-', '');
  const allArticles = [...LATEST_BLOGS, ...LATEST_UPDATES];
  const article = allArticles.find(a => String(a.id) === id) || allArticles[0];

  return (
    <div className="py-16 px-6 max-w-4xl mx-auto animate-fade-in-up">
      <Link to="/news" className="cursor-target inline-flex items-center text-ink-soft hover:text-leaf font-medium mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to News
      </Link>
      
      <div className="mb-8">
        <span className="text-sm font-bold uppercase tracking-wider text-leaf bg-mint px-3 py-1.5 rounded inline-block mb-4">
          {article.tag || article.category || 'Article'}
        </span>
        <h1 className="text-4xl md:text-5xl font-display text-forest-deep mb-6 leading-tight">
          {article.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-6 text-ink-soft pb-8 border-b border-line">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="font-medium">CS Prashant Kumar</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{article.date || 'August 12, 2026'}</span>
          </div>
          <div className="flex-grow"></div>
          <div className="flex items-center gap-3">
            <button className="cursor-target p-2 rounded-full hover:bg-mint text-forest transition-colors">
              <Bookmark className="w-5 h-5" />
            </button>
            <button className="cursor-target p-2 rounded-full hover:bg-mint text-forest transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {article.image && (
        <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-12">
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="prose prose-lg prose-forest max-w-none text-ink-soft">
        <p className="lead text-xl text-ink font-medium mb-8">
          {article.summary || article.desc || 'An in-depth look at recent regulatory developments and their implications for compliance professionals across industries.'}
        </p>
        
        {article.fullContent ? (
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.fullContent.replace(/\n/g, '<br/>').replace(/### /g, '<h3>').replace(/#### /g, '<h4>').replace(/- \*\*/g, '<li><strong>').replace(/\*\*/g, '</strong>').replace(/- /g, '<li>')) }} />
        ) : (
          <>
            <h2 className="text-2xl font-display text-forest-deep mt-8 mb-4">Understanding the Context</h2>
            <p className="mb-6">
              {article.content || 'Regulatory frameworks are continuously evolving to address emerging risks and align with global best practices. This latest development introduces several key changes that require immediate attention from compliance teams.'}
            </p>
            <p className="mb-6">
              Organizations must proactively assess their current practices against these new requirements to avoid potential penalties and ensure smooth operations. The focus is increasingly shifting towards proactive compliance rather than reactive damage control.
            </p>

            <h2 className="text-2xl font-display text-forest-deep mt-8 mb-4">Key Takeaways</h2>
            <ul className="list-disc pl-6 space-y-2 mb-8">
              <li>Immediate review of existing policies is recommended.</li>
              <li>New reporting templates must be adopted by the next quarter.</li>
              <li>Board-level awareness and approval are mandatory for the revised framework.</li>
              <li>Failing to comply may result in heightened scrutiny during subsequent audits.</li>
            </ul>
          </>
        )}

        <div className="bg-mint-deep p-6 rounded-xl border border-leaf/20 my-10">
          <h3 className="font-semibold text-forest-deep mb-2">Author's Note</h3>
          <p className="text-sm">
            While these changes may seem burdensome initially, they offer an opportunity to streamline internal controls and build a more resilient compliance architecture. Need help navigating these changes? Check out our Diagnostic Tests.
          </p>
        </div>
      </div>
    </div>
  );
}
