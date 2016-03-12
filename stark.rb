require 'sinatra'
set :public_folder, 'public'

get "/" do
  erb :index
end

get "/timeline" do
  File.read(File.join('public', 'timeline.html'))
end