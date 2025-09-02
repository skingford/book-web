-- 创建分类表
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#2563eb',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_categories_name ON categories(name);

-- 设置权限
GRANT SELECT ON categories TO anon;
GRANT ALL PRIVILEGES ON categories TO authenticated;

-- 创建收藏表
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    favicon_url VARCHAR(500),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_bookmarks_category_id ON bookmarks(category_id);
CREATE INDEX idx_bookmarks_title ON bookmarks(title);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);

-- 全文搜索索引
CREATE INDEX idx_bookmarks_search ON bookmarks USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- 设置权限
GRANT SELECT ON bookmarks TO anon;
GRANT ALL PRIVILEGES ON bookmarks TO authenticated;

-- 创建更新时间函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为表添加更新时间触发器
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookmarks_updated_at BEFORE UPDATE ON bookmarks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 初始化分类数据
INSERT INTO categories (name, color, description) VALUES
('工作学习', '#2563eb', '工作和学习相关的网站收藏'),
('娱乐休闲', '#10b981', '娱乐和休闲相关的网站收藏'),
('工具软件', '#f59e0b', '实用工具和软件相关的网站收藏'),
('技术开发', '#8b5cf6', '编程和技术开发相关的网站收藏');

-- 初始化收藏数据
INSERT INTO bookmarks (title, url, description, category_id) 
SELECT 
    'GitHub', 
    'https://github.com', 
    '全球最大的代码托管平台', 
    id 
FROM categories WHERE name = '技术开发';

INSERT INTO bookmarks (title, url, description, category_id) 
SELECT 
    'Google', 
    'https://google.com', 
    '全球最大的搜索引擎', 
    id 
FROM categories WHERE name = '工作学习';

INSERT INTO bookmarks (title, url, description, category_id) 
SELECT 
    'YouTube', 
    'https://youtube.com', 
    '全球最大的视频分享平台', 
    id 
FROM categories WHERE name = '娱乐休闲';

INSERT INTO bookmarks (title, url, description, category_id) 
SELECT 
    'VS Code', 
    'https://code.visualstudio.com', 
    '微软开发的免费代码编辑器', 
    id 
FROM categories WHERE name = '工具软件';