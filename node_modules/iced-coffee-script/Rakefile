require 'rubygems'
require 'erb'
require 'fileutils'
require 'rake/testtask'
require 'json'

desc "Build the documentation page"
task :doc do
  source = 'documentation/index.html.erb'
  child = fork { exec "bin/coffee -bcw -o documentation/js documentation/coffee/*.coffee" }
  at_exit { Process.kill("INT", child) }
  Signal.trap("INT") { exit }
  loop do
    mtime = File.stat(source).mtime
    if !@mtime || mtime > @mtime
      rendered = ERB.new(File.read(source)).result(binding)
      File.open('index.html', 'w+') {|f| f.write(rendered) }
    end
    @mtime = mtime
    sleep 1
  end
end

desc "Build iced-coffee-script-source gem"
task :gem do
  require 'rubygems'
  require 'rubygems/package'

  gemspec = Gem::Specification.new do |s|
    s.name      = 'iced-coffee-script-source'
    s.version   = JSON.parse(File.read('package.json'))["version"]
    s.date      = Time.now.strftime("%Y-%m-%d")

    s.homepage    = "http://maxtaco.github.com/coffee-script/"
    s.summary     = "The IcedCoffeeScript Compiler"
    s.description = <<-EOS
      IcedCoffeeScript is a superset of CoffeeScript that introduces
      the await and defer keywords for streamlined async control flow.
    EOS

    s.files = [
      'lib/iced_coffee_script/coffee-script.js',
      'lib/iced_coffee_script/source.rb'
    ]

    s.authors           = ['Max Krohn']
    s.email             = 'themax@gmail.com'
    s.rubyforge_project = 'iced-coffee-script-source'
  end

  file = File.open("iced-coffee-script-source.gem", "w")
  Gem::Package.open(file, 'w') do |pkg|
    pkg.metadata = gemspec.to_yaml

    path = "lib/iced_coffee_script/source.rb"
    contents = <<-ERUBY
module IcedCoffeeScript
  module Source
    def self.bundled_path
      File.expand_path("../coffee-script.js", __FILE__)
    end
  end
end
    ERUBY
    pkg.add_file_simple(path, 0644, contents.size) do |tar_io|
      tar_io.write(contents)
    end

    contents = File.read("extras/coffee-script.js")
    path = "lib/iced_coffee_script/coffee-script.js"
    pkg.add_file_simple(path, 0644, contents.size) do |tar_io|
      tar_io.write(contents)
    end
  end
end
