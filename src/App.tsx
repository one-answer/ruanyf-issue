import { useEffect, useState, useRef, useCallback } from 'react'
import axios from 'axios'
import { Issue, CategoryMap, SortOption } from './types'
import IssueList from './components/IssueList'
import CategoryTabs from './components/CategoryTabs'
import SortSelector from './components/SortSelector'
import ThemeToggle from './components/ThemeToggle'
import './App.css'

function App() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('全部')
  const [sortOption, setSortOption] = useState<SortOption>('newest')
  const [categories, setCategories] = useState<CategoryMap>({})
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const observer = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Function to detect if an issue is an open source recommendation
  const isOpenSourceRecommendation = (title: string): boolean => {
    // Only match titles that contain exactly "开源自荐"
    return title.includes('开源自荐');
  };

  // Function to detect if an issue is a tool recommendation
  const isToolRecommendation = (title: string): boolean => {
    // Match titles that contain either "工具自荐" or "工具推荐"
    return title.includes('工具自荐') || title.includes('工具推荐');
  };

  // Function to detect if an issue is a website recommendation
  const isWebsiteRecommendation = (title: string): boolean => {
    // Only match titles that contain exactly "网站自荐"
    return title.includes('网站自荐');
  };

  // Function to detect if an issue is an article recommendation
  const isArticleRecommendation = (title: string): boolean => {
    // Match titles that contain either "文章自荐" or "文章推荐"
    return title.includes('文章自荐') || title.includes('文章推荐');
  };

  // Define sorting functions
  const sortByLatest = (a: Issue, b: Issue): number => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  };

  const sortByOldest = (a: Issue, b: Issue): number => {
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  };

  const sortByMostComments = (a: Issue, b: Issue): number => {
    return b.comments - a.comments;
  };

  // Function to fetch issues
  const fetchIssues = useCallback(async (pageNum: number, isLoadingMore = false) => {
    try {
      if (isLoadingMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      // GitHub API for issues in ruanyf/weekly repository
      const response = await axios.get(
        'https://api.github.com/repos/ruanyf/weekly/issues',
        {
          params: {
            state: 'open',
            per_page: 100,
            page: pageNum,
          },
        }
      );

      const fetchedIssues = response.data.map((issue: any) => {
        const isOpenSource = isOpenSourceRecommendation(issue.title);
        const isTool = isToolRecommendation(issue.title);
        const isWebsite = isWebsiteRecommendation(issue.title);
        const isArticle = isArticleRecommendation(issue.title);
        
        return {
          id: issue.id,
          number: issue.number,
          title: issue.title,
          body: issue.body || '',
          labels: issue.labels.map((label: any) => ({
            id: label.id,
            name: label.name,
            color: label.color,
          })),
          created_at: issue.created_at,
          updated_at: issue.updated_at,
          html_url: issue.html_url,
          user: {
            login: issue.user.login,
            avatar_url: issue.user.avatar_url,
            html_url: issue.user.html_url,
          },
          comments: issue.comments,
          is_open_source_recommendation: isOpenSource,
          is_tool_recommendation: isTool,
          is_website_recommendation: isWebsite,
          is_article_recommendation: isArticle,
        };
      });

      // If no issues returned or less than 100, we've reached the end
      if (fetchedIssues.length === 0 || fetchedIssues.length < 100) {
        setHasMore(false);
      }

      // If loading more, append to existing issues, otherwise replace
      const updatedIssues = isLoadingMore 
        ? [...issues, ...fetchedIssues] 
        : fetchedIssues;

      // Process categories from all issues
      const categoryMap: CategoryMap = { 
        '全部': updatedIssues.length,
        '开源自荐': updatedIssues.filter(issue => issue.is_open_source_recommendation).length,
        '工具自荐': updatedIssues.filter(issue => issue.is_tool_recommendation).length,
        '网站自荐': updatedIssues.filter(issue => issue.is_website_recommendation).length,
        '文章自荐': updatedIssues.filter(issue => issue.is_article_recommendation).length
      };
      
      updatedIssues.forEach((issue: Issue) => {
        issue.labels.forEach(label => {
          if (!categoryMap[label.name]) {
            categoryMap[label.name] = 0;
          }
          categoryMap[label.name]++;
        });
      });

      setIssues(updatedIssues);
      setCategories(categoryMap);
    } catch (err) {
      console.error('Error fetching issues:', err);
      setError('无法获取 Issues 数据，请稍后再试');
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [issues]);

  // Load initial issues
  useEffect(() => {
    // Reset when changing categories or sort options
    setIssues([]);
    setPage(1);
    setHasMore(true);
    fetchIssues(1, false);
  }, [activeCategory, sortOption]);

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    if (loading || loadingMore) return;

    // Disconnect any existing observer
    if (observer.current) {
      observer.current.disconnect();
    }

    // Create a new observer
    const callback = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        loadNextPage();
      }
    };

    observer.current = new IntersectionObserver(callback, {
      rootMargin: '100px',
    });

    // Observe the load more element
    if (loadMoreRef.current) {
      observer.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loading, loadingMore, hasMore, loadMoreRef.current]);

  // Function to load next page
  const loadNextPage = () => {
    if (hasMore && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchIssues(nextPage, true);
    }
  };

  // Filter issues by selected category
  const categoryFilteredIssues = 
    activeCategory === '全部'
      ? issues
      : activeCategory === '开源自荐'
        ? issues.filter(issue => issue.is_open_source_recommendation)
        : activeCategory === '工具自荐'
          ? issues.filter(issue => issue.is_tool_recommendation)
          : activeCategory === '网站自荐'
            ? issues.filter(issue => issue.is_website_recommendation)
            : activeCategory === '文章自荐'
              ? issues.filter(issue => issue.is_article_recommendation)
              : issues.filter(issue => 
                  issue.labels.some(label => label.name === activeCategory)
                );
  
  // Sort the filtered issues
  const sortedIssues = [...categoryFilteredIssues].sort((a, b) => {
    if (sortOption === 'newest') return sortByLatest(a, b);
    if (sortOption === 'oldest') return sortByOldest(a, b);
    if (sortOption === 'most-commented') return sortByMostComments(a, b);
    if (sortOption === 'recently-updated') return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">科技爱好者周刊 - 列表</h1>
              <p className="text-gray-500 dark:text-gray-400">查看 Ruanyf 的周刊 GitHub 仓库中的推荐</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <CategoryTabs 
              categories={categories} 
              activeCategory={activeCategory} 
              setActiveCategory={setActiveCategory} 
            />
            
            <div className="mt-4 sm:mt-0">
              <SortSelector
                sortOption={sortOption}
                setSortOption={setSortOption}
              />
            </div>
          </div>
          
          {loading && !loadingMore ? (
            <div className="flex justify-center items-center h-64">
              <div className="loader dark:border-gray-700 dark:border-t-blue-500"></div>
            </div>
          ) : error && issues.length === 0 ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 rounded-md p-4">
              {error}
            </div>
          ) : (
            <>
              <IssueList issues={sortedIssues} />
              
              {/* Load more section */}
              <div className="mt-8 text-center" ref={loadMoreRef}>
                {loadingMore && (
                  <div className="py-4">
                    <div className="loader mx-auto dark:border-gray-700 dark:border-t-blue-500"></div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">正在加载更多...</p>
                  </div>
                )}
                
                {!loadingMore && hasMore && categoryFilteredIssues.length > 0 && (
                  <button
                    onClick={loadNextPage}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  >
                    加载更多
                  </button>
                )}
                
                {!hasMore && issues.length > 0 && (
                  <p className="py-4 text-gray-600 dark:text-gray-400">
                    {categoryFilteredIssues.length === 0 
                      ? '没有符合条件的 issue'
                      : '已加载全部内容'}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </main>
      
      <footer className="bg-white dark:bg-gray-800 shadow-inner mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            数据来源于 <a href="https://github.com/ruanyf/weekly/issues" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">ruanyf/weekly</a> 仓库
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App 