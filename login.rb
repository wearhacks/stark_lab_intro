require 'rubygems'
require 'sinatra'
require "sinatra/base"
require "sinatra/content_for"
require 'json'
require 'pry'
require 'omniauth'
require 'omniauth-github'
require 'omniauth-facebook'
require 'omniauth-twitter'
require 'mongo_mapper'
set :public_folder, 'public'
class User
  include MongoMapper::Document
  key :firstname, :type => String
  key :lastname, :type => String
  key :email, :type => String
  key :avatar, :type => String
  key :provider, :type => String
end

class SinatraApp < Sinatra::Base
  helpers Sinatra::ContentFor
  configure do
    set :sessions, true
    set :inline_templates, true

    if ENV['MONGOLAB_URI']
      MongoMapper.setup({'stark_prod' => {'uri' => ENV['MONGOLAB_URI']}}, 'stark_prod')
    else
      MongoMapper.connection = Mongo::Connection.new('localhost', 27017)
      MongoMapper.database = "stark_dev"
    end
  end
  use OmniAuth::Builder do
    provider :github, '1a2b64272d665d8d9c8f','2bb2410262cae42599149ae0173d0997afd8d243'
    provider :facebook, '888310144647900','5060d2cf464b2f2d3e71b798f00480f0'
  end
  
  get "/" do
    erb :intro

  end
#  get '/' do
#    erb "
#    
#    <a href='http://localhost:9292/auth/facebook'>Login with Facebook</a><br>
#    <a href='http://localhost:9292/auth/twitter'>Login with twitter</a><br>
#    <a href='http://localhost:9292/auth/att-foundry'>Login with att-foundry</a>"
#  end
  
  get '/auth/:provider/callback' do
    user = User.first(:email => request.env['omniauth.auth']['info']['email'])
    if !user
      user = User.new(
        :email => request.env['omniauth.auth']['info']['email'],
        :firstname => request.env['omniauth.auth']['info']['name'].split(' ').first,
        :lastname => request.env['omniauth.auth']['info']['name'].split(' ').last,
        :avatar => request.env['omniauth.auth']['info']['image'],
        :provider => request.env['omniauth.auth']
      )
      user.save!
    end
    session[:authenticated] = user
    redirect to('/start')
  end
  
  get "/start" do
    if session[:authenticated]
      erb :index , :locals => {:user => session[:authenticated]}
    else
      redirect "/", 303
    end
  end

  get '/auth/failure' do
    erb "<h1>Authentication Failed:</h1><h3>message:<h3> <pre>#{params}</pre>"
  end
  
  get '/auth/:provider/deauthorized' do
    erb "#{params[:provider]} has deauthorized this app."
  end
  
  get '/protected' do
    throw(:halt, [401, "Not authorized\n"]) unless session[:authenticated]
    erb "<pre>#{request.env['omniauth.auth'].to_json}</pre><hr>
         <a href='/logout'>Logout</a>"
  end
  
  get '/logout' do
    session[:authenticated] = false
    redirect '/'
  end

end

