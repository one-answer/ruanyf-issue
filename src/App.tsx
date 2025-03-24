import { useEffect, useState } from 'react'
import axios from 'axios'
import { Issue, CategoryMap, SortOption } from './types'
import IssueList from './components/IssueList'
import CategoryTabs from './components/CategoryTabs'
import SortSelector from './components/SortSelector'
import './App.css'

function App() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('全部')
  const [sortOption, setSortOption] = useState<SortOption>('newest')
  const [categories, setCategories] = useState<CategoryMap>({})

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

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // GitHub API for issues in ruanyf/weekly repository
        const response = await axios.get(
          'https://api.github.com/repos/ruanyf/weekly/issues',
          {
            params: {
              state: 'open',
              per_page: 100,
            },
          }
        )

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

        // Process categories from labels
        const categoryMap: CategoryMap = { 
          '全部': fetchedIssues.length,
          '开源自荐': fetchedIssues.filter(issue => issue.is_open_source_recommendation).length,
          '工具自荐': fetchedIssues.filter(issue => issue.is_tool_recommendation).length,
          '网站自荐': fetchedIssues.filter(issue => issue.is_website_recommendation).length,
          '文章自荐': fetchedIssues.filter(issue => issue.is_article_recommendation).length
        }
        
        fetchedIssues.forEach((issue: Issue) => {
          issue.labels.forEach(label => {
            if (!categoryMap[label.name]) {
              categoryMap[label.name] = 0
            }
            categoryMap[label.name]++
          })
        })

        setIssues(fetchedIssues)
        setCategories(categoryMap)
      } catch (err) {
        console.error('Error fetching issues:', err)
        setError('无法获取 Issues 数据，请稍后再试')
      } finally {
        setLoading(false)
      }
    }

    fetchIssues()
  }, [])

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
                )
  
  // Sort the filtered issues
  const sortedIssues = [...categoryFilteredIssues].sort((a, b) => {
    if (sortOption === 'newest') return sortByLatest(a, b);
    if (sortOption === 'oldest') return sortByOldest(a, b);
    if (sortOption === 'most-commented') return sortByMostComments(a, b);
    if (sortOption === 'recently-updated') return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-800">科技爱好者周刊 - 列表</h1>
          <p className="text-gray-500">查看 Ruanyf 的周刊 GitHub 仓库中的开源推荐</p>
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
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="loader"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
              {error}
            </div>
          ) : (
            <IssueList issues={sortedIssues} />
          )}
        </div>
      </main>
      
      <footer className="bg-white shadow-inner mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            数据来源于 <a href="https://github.com/ruanyf/weekly/issues" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">ruanyf/weekly</a> 仓库
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App 