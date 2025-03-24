import { useEffect, useState } from 'react'
import axios from 'axios'
import { Issue, CategoryMap, SortOption } from './types'
import IssueList from './components/IssueList'
import CategoryTabs from './components/CategoryTabs'
import SortSelector from './components/SortSelector'

function App() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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
    // Only match titles that contain exactly "工具自荐"
    return title.includes('工具自荐');
  };

  // Function to detect if an issue is a website recommendation
  const isWebsiteRecommendation = (title: string): boolean => {
    // Only match titles that contain exactly "网站自荐"
    return title.includes('网站自荐');
  };

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true)
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
          };
        });

        // Process categories from labels
        const categoryMap: CategoryMap = { 
          '全部': fetchedIssues.length,
          '开源自荐': fetchedIssues.filter(issue => issue.is_open_source_recommendation).length,
          '工具自荐': fetchedIssues.filter(issue => issue.is_tool_recommendation).length,
          '网站自荐': fetchedIssues.filter(issue => issue.is_website_recommendation).length
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
        setLoading(false)
      } catch (err) {
        console.error('Error fetching issues:', err)
        setError('无法获取 Issues 数据，请稍后再试')
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
            : issues.filter(issue => 
                issue.labels.some(label => label.name === activeCategory)
              )
  
  // Sort the filtered issues
  const sortedIssues = [...categoryFilteredIssues].sort((a, b) => {
    switch (sortOption) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'most-commented':
        return b.comments - a.comments;
      case 'recently-updated':
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          阮一峰的周刊 Issues
        </h1>
        <p className="text-gray-600">
          展示 <a href="https://github.com/ruanyf/weekly/issues" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ruanyf/weekly</a> 仓库的 issues 并按类别分类
        </p>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
            <CategoryTabs 
              categories={categories} 
              activeCategory={activeCategory} 
              setActiveCategory={setActiveCategory} 
            />
            <SortSelector
              sortOption={sortOption}
              setSortOption={setSortOption}
            />
          </div>
          <IssueList issues={sortedIssues} />
        </>
      )}
    </div>
  )
}

export default App 