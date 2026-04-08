const fs = require('fs')

const img = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABQSURBVFhH7c4xAQAgDMCw6v/TK0GCBAt9sne9MwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIBfXwAA//8DAHsABGimfQAAAABJRU5ErkJggg==',
  'base64'
)

fs.writeFileSync('resources/icon.png', img)
console.log('Icon created successfully!')