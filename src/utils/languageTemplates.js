// Language templates for all supported programming languages
// These provide sample code comparisons to demonstrate diff functionality

export const languageTemplates = {
    json: {
        left: `{
  "name": "John Doe",
  "age": 30,
  "city": "New York",
  "hobbies": ["reading", "swimming"],
  "contact": {
    "email": "john@example.com",
    "phone": "555-1234"
  }
}`,
        right: `{
  "name": "Jane Doe", 
  "age": 25,
  "city": "Los Angeles",
  "hobbies": ["reading", "cycling", "photography"],
  "contact": {
    "email": "jane@example.com",
    "phone": "555-5678",
    "website": "https://jane.dev"
  },
  "skills": ["JavaScript", "Python", "React"]
}`
    },
    
    javascript: {
        left: `function calculateSum(a, b) {
    return a + b;
}

const numbers = [1, 2, 3, 4, 5];
const result = numbers.reduce((sum, num) => sum + num, 0);
console.log(result);`,
        right: `function calculateSum(...numbers) {
    return numbers.reduce((sum, num) => sum + num, 0);
}

const calculateAverage = (numbers) => {
    return numbers.length > 0 ? calculateSum(...numbers) / numbers.length : 0;
};

const numbers = [1, 2, 3, 4, 5, 6];
const sum = calculateSum(...numbers);
const avg = calculateAverage(numbers);
console.log(\`Sum: \${sum}, Average: \${avg}\`);`
    },
    
    python: {
        left: `def calculate_sum(numbers):
    total = 0
    for num in numbers:
        total += num
    return total

numbers = [1, 2, 3, 4, 5]
result = calculate_sum(numbers)
print(result)`,
        right: `def calculate_sum(numbers):
    return sum(numbers)

def calculate_average(numbers):
    return sum(numbers) / len(numbers) if numbers else 0

def calculate_stats(numbers):
    return {
        'sum': calculate_sum(numbers),
        'average': calculate_average(numbers),
        'count': len(numbers)
    }

numbers = [1, 2, 3, 4, 5, 6]
stats = calculate_stats(numbers)
print(f"Stats: {stats}")`
    },
    
    java: {
        left: `public class Calculator {
    public static int sum(int[] numbers) {
        int total = 0;
        for (int num : numbers) {
            total += num;
        }
        return total;
    }
    
    public static void main(String[] args) {
        int[] numbers = {1, 2, 3, 4, 5};
        System.out.println(sum(numbers));
    }
}`,
        right: `import java.util.Arrays;
import java.util.OptionalDouble;

public class Calculator {
    public static int sum(int[] numbers) {
        return Arrays.stream(numbers).sum();
    }
    
    public static OptionalDouble average(int[] numbers) {
        return Arrays.stream(numbers).average();
    }
    
    public static void printStats(int[] numbers) {
        System.out.println("Sum: " + sum(numbers));
        System.out.println("Average: " + 
            average(numbers).orElse(0.0));
        System.out.println("Count: " + numbers.length);
    }
    
    public static void main(String[] args) {
        int[] numbers = {1, 2, 3, 4, 5, 6};
        printStats(numbers);
    }
}`
    },
    
    php: {
        left: `<?php
function calculateSum($numbers) {
    $total = 0;
    foreach ($numbers as $num) {
        $total += $num;
    }
    return $total;
}

$numbers = [1, 2, 3, 4, 5];
$result = calculateSum($numbers);
echo $result;
?>`,
        right: `<?php
function calculateSum($numbers) {
    return array_sum($numbers);
}

function calculateAverage($numbers) {
    return count($numbers) > 0 ? calculateSum($numbers) / count($numbers) : 0;
}

function getStats($numbers) {
    return [
        'sum' => calculateSum($numbers),
        'average' => calculateAverage($numbers),
        'count' => count($numbers)
    ];
}

$numbers = [1, 2, 3, 4, 5, 6];
$stats = getStats($numbers);
print_r($stats);
?>`
    },
    
    ruby: {
        left: `def calculate_sum(numbers)
  total = 0
  numbers.each do |num|
    total += num
  end
  total
end

numbers = [1, 2, 3, 4, 5]
result = calculate_sum(numbers)
puts result`,
        right: `def calculate_sum(numbers)
  numbers.sum
end

def calculate_average(numbers)
  return 0 if numbers.empty?
  calculate_sum(numbers).to_f / numbers.length
end

def calculate_stats(numbers)
  {
    sum: calculate_sum(numbers),
    average: calculate_average(numbers),
    count: numbers.length
  }
end

numbers = [1, 2, 3, 4, 5, 6]
stats = calculate_stats(numbers)
puts "Stats: #{stats}"`
    },
    
    go: {
        left: `package main

import "fmt"

func calculateSum(numbers []int) int {
    total := 0
    for _, num := range numbers {
        total += num
    }
    return total
}

func main() {
    numbers := []int{1, 2, 3, 4, 5}
    result := calculateSum(numbers)
    fmt.Println(result)
}`,
        right: `package main

import "fmt"

func calculateSum(numbers []int) int {
    total := 0
    for _, num := range numbers {
        total += num
    }
    return total
}

func calculateAverage(numbers []int) float64 {
    if len(numbers) == 0 {
        return 0
    }
    return float64(calculateSum(numbers)) / float64(len(numbers))
}

func main() {
    numbers := []int{1, 2, 3, 4, 5, 6}
    sum := calculateSum(numbers)
    avg := calculateAverage(numbers)
    fmt.Printf("Sum: %d, Average: %.2f, Count: %d\\n", sum, avg, len(numbers))
}`
    },
    
    rust: {
        left: `fn calculate_sum(numbers: &[i32]) -> i32 {
    let mut total = 0;
    for num in numbers {
        total += num;
    }
    total
}

fn main() {
    let numbers = vec![1, 2, 3, 4, 5];
    let result = calculate_sum(&numbers);
    println!("{}", result);
}`,
        right: `fn calculate_sum(numbers: &[i32]) -> i32 {
    numbers.iter().sum()
}

fn calculate_average(numbers: &[i32]) -> f64 {
    if numbers.is_empty() {
        0.0
    } else {
        calculate_sum(numbers) as f64 / numbers.len() as f64
    }
}

fn print_stats(numbers: &[i32]) {
    println!("Sum: {}", calculate_sum(numbers));
    println!("Average: {:.2}", calculate_average(numbers));
    println!("Count: {}", numbers.len());
}

fn main() {
    let numbers = vec![1, 2, 3, 4, 5, 6];
    print_stats(&numbers);
}`
    },
    
    typescript: {
        left: `function calculateSum(a: number, b: number): number {
    return a + b;
}

const numbers: number[] = [1, 2, 3, 4, 5];
const result: number = numbers.reduce((sum, num) => sum + num, 0);
console.log(result);`,
        right: `interface Stats {
    sum: number;
    average: number;
    count: number;
}

function calculateSum(...numbers: number[]): number {
    return numbers.reduce((sum, num) => sum + num, 0);
}

function calculateAverage(numbers: number[]): number {
    return numbers.length > 0 ? calculateSum(...numbers) / numbers.length : 0;
}

function getStats(numbers: number[]): Stats {
    return {
        sum: calculateSum(...numbers),
        average: calculateAverage(numbers),
        count: numbers.length
    };
}

const numbers: number[] = [1, 2, 3, 4, 5, 6];
const stats: Stats = getStats(numbers);
console.log(\`Stats:\`, stats);`
    },
    
    html: {
        left: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Page</title>
</head>
<body>
    <h1>Welcome</h1>
    <p>Hello World!</p>
</body>
</html>`,
        right: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Enhanced Page</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <nav>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <h1>Welcome to My Site</h1>
        <p>Hello World! This is an enhanced version.</p>
        <section id="features">
            <h2>Features</h2>
            <ul>
                <li>Responsive Design</li>
                <li>Modern CSS</li>
                <li>Accessible</li>
            </ul>
        </section>
    </main>
    <footer>
        <p>&copy; 2025 My Website</p>
    </footer>
</body>
</html>`
    },
    
    css: {
        left: `body {
    margin: 0;
    font-family: Arial, sans-serif;
}

h1 {
    color: blue;
    text-align: center;
}

p {
    font-size: 16px;
}`,
        right: `/* CSS Reset */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f4f4f4;
}

header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem 0;
    position: sticky;
    top: 0;
    z-index: 1000;
}

nav ul {
    display: flex;
    list-style: none;
    justify-content: center;
    gap: 2rem;
}

nav a {
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.3s ease;
}

nav a:hover {
    background-color: rgba(255, 255, 255, 0.2);
}

main {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
    color: #2c3e50;
    text-align: center;
    margin-bottom: 2rem;
    font-size: 2.5rem;
}

p {
    font-size: 1.1rem;
    margin-bottom: 1rem;
}

footer {
    text-align: center;
    padding: 2rem;
    background-color: #2c3e50;
    color: white;
    margin-top: 2rem;
}`
    },
    
    xml: {
        left: `<?xml version="1.0" encoding="UTF-8"?>
<users>
    <user id="1">
        <name>John Doe</name>
        <email>john@example.com</email>
        <age>30</age>
    </user>
    <user id="2">
        <name>Jane Smith</name>
        <email>jane@example.com</email>
        <age>25</age>
    </user>
</users>`,
        right: `<?xml version="1.0" encoding="UTF-8"?>
<users xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <user id="1" status="active">
        <personal>
            <name>John Doe</name>
            <email>john@example.com</email>
            <age>30</age>
            <city>New York</city>
        </personal>
        <preferences>
            <theme>dark</theme>
            <notifications>true</notifications>
        </preferences>
    </user>
    <user id="2" status="active">
        <personal>
            <name>Jane Smith</name>
            <email>jane@example.com</email>
            <age>25</age>
            <city>Los Angeles</city>
        </personal>
        <preferences>
            <theme>light</theme>
            <notifications>false</notifications>
        </preferences>
        <skills>
            <skill level="expert">JavaScript</skill>
            <skill level="intermediate">Python</skill>
            <skill level="beginner">Go</skill>
        </skills>
    </user>
</users>`
    },
    
    yaml: {
        left: `name: My Application
version: 1.0.0
description: A simple application

dependencies:
  - express
  - lodash
  - moment

scripts:
  start: node app.js
  test: npm test`,
        right: `name: My Enhanced Application
version: 2.0.0
description: An enhanced application with more features
author: John Doe
license: MIT

dependencies:
  production:
    - express: "^4.18.0"
    - lodash: "^4.17.21"
    - moment: "^2.29.0"
    - cors: "^2.8.5"
  development:
    - jest: "^29.0.0"
    - nodemon: "^2.0.20"
    - eslint: "^8.0.0"

scripts:
  start: node app.js
  dev: nodemon app.js
  test: jest
  lint: eslint .
  build: npm run lint && npm run test

environments:
  development:
    port: 3000
    debug: true
  production:
    port: 8080
    debug: false

features:
  - authentication
  - api_versioning  
  - rate_limiting
  - logging`
    },
    
    sql: {
        left: `SELECT id, name, email
FROM users 
WHERE age > 18
ORDER BY name;`,
        right: `-- Enhanced user query with joins and aggregations
SELECT 
    u.id,
    u.name,
    u.email,
    u.age,
    p.city,
    p.country,
    COUNT(o.id) as order_count,
    SUM(o.total_amount) as total_spent
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.age > 18 
    AND u.status = 'active'
    AND u.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
GROUP BY u.id, u.name, u.email, u.age, p.city, p.country
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC, u.name ASC
LIMIT 50;`
    },
    
    shell: {
        left: `#!/bin/bash

echo "Hello World"
ls -la
pwd`,
        right: `#!/bin/bash

# Enhanced shell script with functions and error handling
set -euo pipefail

# Global variables
readonly SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
readonly LOG_FILE="/tmp/script.log"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $*" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log "ERROR: $1"
    exit 1
}

# Main function
main() {
    log "Starting enhanced script"
    
    # Check if directory exists
    if [[ ! -d "$SCRIPT_DIR" ]]; then
        error_exit "Script directory not found: $SCRIPT_DIR"
    fi
    
    log "Current directory: $(pwd)"
    log "Script directory: $SCRIPT_DIR"
    
    # List files with details
    log "Files in current directory:"
    ls -la || error_exit "Failed to list files"
    
    # System information
    log "System info: $(uname -a)"
    log "Free disk space:"
    df -h / || error_exit "Failed to get disk space"
    
    log "Script completed successfully"
}

# Run main function
main "$@"`
    },
    
    // Additional popular languages for comparison
    csharp: {
        left: `using System;
using System.Collections.Generic;

public class Calculator
{
    public static int Sum(int[] numbers)
    {
        int total = 0;
        foreach (int num in numbers)
        {
            total += num;
        }
        return total;
    }

    public static void Main(string[] args)
    {
        int[] numbers = {1, 2, 3, 4, 5};
        Console.WriteLine(Sum(numbers));
    }
}`,
        right: `using System;
using System.Collections.Generic;
using System.Linq;

public class Calculator
{
    public static int Sum(IEnumerable<int> numbers)
    {
        return numbers.Sum();
    }

    public static double Average(IEnumerable<int> numbers)
    {
        return numbers.Any() ? numbers.Average() : 0.0;
    }

    public static void PrintStats(IEnumerable<int> numbers)
    {
        var numList = numbers.ToList();
        Console.WriteLine($"Sum: {Sum(numList)}");
        Console.WriteLine($"Average: {Average(numList):F2}");
        Console.WriteLine($"Count: {numList.Count}");
    }

    public static void Main(string[] args)
    {
        var numbers = new[] {1, 2, 3, 4, 5, 6};
        PrintStats(numbers);
    }
}`
    },
    
    cpp: {
        left: `#include <iostream>
#include <vector>

int calculateSum(const std::vector<int>& numbers) {
    int total = 0;
    for (int num : numbers) {
        total += num;
    }
    return total;
}

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    std::cout << calculateSum(numbers) << std::endl;
    return 0;
}`,
        right: `#include <iostream>
#include <vector>
#include <numeric>
#include <iomanip>

class Calculator {
public:
    static int sum(const std::vector<int>& numbers) {
        return std::accumulate(numbers.begin(), numbers.end(), 0);
    }
    
    static double average(const std::vector<int>& numbers) {
        return numbers.empty() ? 0.0 : 
               static_cast<double>(sum(numbers)) / numbers.size();
    }
    
    static void printStats(const std::vector<int>& numbers) {
        std::cout << "Sum: " << sum(numbers) << std::endl;
        std::cout << "Average: " << std::fixed << std::setprecision(2) 
                  << average(numbers) << std::endl;
        std::cout << "Count: " << numbers.size() << std::endl;
    }
};

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5, 6};
    Calculator::printStats(numbers);
    return 0;
}`
    },
    
    kotlin: {
        left: `fun calculateSum(numbers: List<Int>): Int {
    var total = 0
    for (num in numbers) {
        total += num
    }
    return total
}

fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)
    println(calculateSum(numbers))
}`,
        right: `data class Stats(val sum: Int, val average: Double, val count: Int)

object Calculator {
    fun sum(numbers: List<Int>) = numbers.sum()
    
    fun average(numbers: List<Int>) = 
        if (numbers.isEmpty()) 0.0 else numbers.average()
    
    fun getStats(numbers: List<Int>) = Stats(
        sum = sum(numbers),
        average = average(numbers),
        count = numbers.size
    )
}

fun main() {
    val numbers = listOf(1, 2, 3, 4, 5, 6)
    val stats = Calculator.getStats(numbers)
    println("Stats: $stats")
    println("Sum: \${stats.sum}, Average: \${String.format("%.2f", stats.average)}")
}`
    },
    
    swift: {
        left: `import Foundation

func calculateSum(_ numbers: [Int]) -> Int {
    var total = 0
    for num in numbers {
        total += num
    }
    return total
}

let numbers = [1, 2, 3, 4, 5]
print(calculateSum(numbers))`,
        right: `import Foundation

struct Calculator {
    static func sum(_ numbers: [Int]) -> Int {
        return numbers.reduce(0, +)
    }
    
    static func average(_ numbers: [Int]) -> Double {
        return numbers.isEmpty ? 0.0 : Double(sum(numbers)) / Double(numbers.count)
    }
    
    static func printStats(_ numbers: [Int]) {
        print("Sum: \\(sum(numbers))")
        print("Average: \\(String(format: "%.2f", average(numbers)))")
        print("Count: \\(numbers.count)")
    }
}

let numbers = [1, 2, 3, 4, 5, 6]
Calculator.printStats(numbers)`
    },
    
    dart: {
        left: `int calculateSum(List<int> numbers) {
  int total = 0;
  for (int num in numbers) {
    total += num;
  }
  return total;
}

void main() {
  List<int> numbers = [1, 2, 3, 4, 5];
  print(calculateSum(numbers));
}`,
        right: `class Calculator {
  static int sum(List<int> numbers) {
    return numbers.fold(0, (sum, num) => sum + num);
  }
  
  static double average(List<int> numbers) {
    return numbers.isEmpty ? 0.0 : sum(numbers) / numbers.length;
  }
  
  static Map<String, dynamic> getStats(List<int> numbers) {
    return {
      'sum': sum(numbers),
      'average': average(numbers),
      'count': numbers.length,
    };
  }
}

void main() {
  List<int> numbers = [1, 2, 3, 4, 5, 6];
  var stats = Calculator.getStats(numbers);
  print('Stats: \$stats');
  print('Sum: \${stats['sum']}, Average: \${stats['average'].toStringAsFixed(2)}');
}`
    },
    
    scala: {
        left: `object Calculator {
  def calculateSum(numbers: List[Int]): Int = {
    var total = 0
    for (num <- numbers) {
      total += num
    }
    total
  }

  def main(args: Array[String]): Unit = {
    val numbers = List(1, 2, 3, 4, 5)
    println(calculateSum(numbers))
  }
}`,
        right: `object Calculator {
  def sum(numbers: List[Int]): Int = numbers.sum
  
  def average(numbers: List[Int]): Double = 
    if (numbers.isEmpty) 0.0 else numbers.sum.toDouble / numbers.length
  
  case class Stats(sum: Int, average: Double, count: Int)
  
  def getStats(numbers: List[Int]): Stats = Stats(
    sum = sum(numbers),
    average = average(numbers),
    count = numbers.length
  )
  
  def main(args: Array[String]): Unit = {
    val numbers = List(1, 2, 3, 4, 5, 6)
    val stats = getStats(numbers)
    println(s"Stats: \$stats")
    println(f"Sum: \${stats.sum}, Average: \${stats.average}%.2f")
  }
}`
    },
    
    r: {
        left: `calculate_sum <- function(numbers) {
  total <- 0
  for (num in numbers) {
    total <- total + num
  }
  return(total)
}

numbers <- c(1, 2, 3, 4, 5)
result <- calculate_sum(numbers)
print(result)`,
        right: `Calculator <- list(
  sum = function(numbers) sum(numbers),
  
  average = function(numbers) {
    if (length(numbers) == 0) 0 else mean(numbers)
  },
  
  get_stats = function(numbers) {
    list(
      sum = sum(numbers),
      average = mean(numbers),
      count = length(numbers),
      median = median(numbers),
      std_dev = sd(numbers)
    )
  }
)

numbers <- c(1, 2, 3, 4, 5, 6)
stats <- Calculator$get_stats(numbers)
cat("Sum:", stats$sum, "\\n")
cat("Average:", round(stats$average, 2), "\\n") 
cat("Median:", stats$median, "\\n")
cat("Count:", stats$count, "\\n")`
    },
    
    powershell: {
        left: `function Calculate-Sum {
    param([int[]]$Numbers)
    
    $total = 0
    foreach ($num in $Numbers) {
        $total += $num
    }
    return $total
}

$numbers = @(1, 2, 3, 4, 5)
$result = Calculate-Sum -Numbers $numbers
Write-Host $result`,
        right: `class Calculator {
    static [int] Sum([int[]]$Numbers) {
        return ($Numbers | Measure-Object -Sum).Sum
    }
    
    static [double] Average([int[]]$Numbers) {
        if ($Numbers.Count -eq 0) { return 0.0 }
        return ($Numbers | Measure-Object -Average).Average
    }
    
    static [hashtable] GetStats([int[]]$Numbers) {
        $stats = $Numbers | Measure-Object -Sum -Average -Minimum -Maximum -Count
        return @{
            Sum = $stats.Sum
            Average = [math]::Round($stats.Average, 2)
            Count = $stats.Count
            Min = $stats.Minimum
            Max = $stats.Maximum
        }
    }
}

$numbers = @(1, 2, 3, 4, 5, 6)
$stats = [Calculator]::GetStats($numbers)
Write-Host "Sum: $($stats.Sum)"
Write-Host "Average: $($stats.Average)"
Write-Host "Count: $($stats.Count)"
Write-Host "Range: $($stats.Min) - $($stats.Max)"`
    },
    
    haskell: {
        left: `calculateSum :: [Int] -> Int
calculateSum [] = 0
calculateSum (x:xs) = x + calculateSum xs

main :: IO ()
main = do
    let numbers = [1, 2, 3, 4, 5]
    print (calculateSum numbers)`,
        right: `data Stats = Stats 
    { statsSum :: Int
    , statsAverage :: Double
    , statsCount :: Int
    } deriving (Show)

calculateSum :: [Int] -> Int
calculateSum = sum

calculateAverage :: [Int] -> Double
calculateAverage [] = 0.0
calculateAverage xs = fromIntegral (sum xs) / fromIntegral (length xs)

getStats :: [Int] -> Stats
getStats xs = Stats 
    { statsSum = calculateSum xs
    , statsAverage = calculateAverage xs
    , statsCount = length xs
    }

printStats :: Stats -> IO ()
printStats stats = do
    putStrLn $ "Sum: " ++ show (statsSum stats)
    putStrLn $ "Average: " ++ show (statsAverage stats)
    putStrLn $ "Count: " ++ show (statsCount stats)

main :: IO ()
main = do
    let numbers = [1, 2, 3, 4, 5, 6]
    let stats = getStats numbers
    printStats stats`
    }
};

// Function to get template for a specific language
export const getLanguageTemplate = (language) => {
    return languageTemplates[language.toLowerCase()] || null;
};

// Function to get all supported languages with templates
// Only returns languages that Monaco Editor supports
export const getSupportedLanguagesWithTemplates = () => {
    // Monaco Editor supported languages that we have templates for
    const monacoSupportedLanguages = [
        'json', 'javascript', 'typescript', 'html', 'css', 'xml', 'yaml', 
        'java', 'python', 'go', 'rust', 'php', 'ruby', 'sql', 'shell',
        'csharp', 'cpp', 'kotlin', 'swift', 'dart', 'scala', 'r', 
        'powershell', 'haskell'
    ];
    
    return Object.keys(languageTemplates).filter(lang => 
        monacoSupportedLanguages.includes(lang)
    );
};

// Function to check if a language has a template
export const hasLanguageTemplate = (language) => {
    return language.toLowerCase() in languageTemplates;
};