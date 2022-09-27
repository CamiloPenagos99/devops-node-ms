pipeline {

  agent any

  triggers {
    githubPush()
  }

  environment {
    FULL_PATH_BRANCH = "${sh(script:'git name-rev --name-only HEAD', returnStdout: true)}"
    GIT_BRANCH = FULL_PATH_BRANCH.substring(FULL_PATH_BRANCH.lastIndexOf('/') + 1, FULL_PATH_BRANCH.length())
  }

  tools {
    nodejs "node-devops-config"
  }

  stages {
    stage('Init') {
      steps {
        sh 'printenv | sort'
        echo "rama" + env.GIT_BRANCH
        echo "Running ${env.BUILD_ID} on ${env.JENKINS_URL}"
        git credentialsId: 'token-github', url: 'https://github.com/CamiloPenagos99/devops-node-ms.git'
        echo 'cloning..'
        sh 'pwd'
        sh 'ls'
      }
    }
    stage('master-branch-stuff') {
      when {
        expression {
          return env.GIT_BRANCH.trim() == "master"
        }
      }
      steps {
        echo 'run this stage - ony if the branch = master branch'
      }
    }
    stage('Dependencies') {
      steps {
        sh 'npm install'
        echo 'installing..'
      }
    }
    stage('Test') {
      steps {
        sh 'npm run test'
        echo 'Testing..'
      }
    }
    stage('Lint') {
      steps {
        sh 'npm run format'
        sh 'npm run lint'
      }
    }
    stage('build') {
      steps {
        sh 'npm run build'
        echo 'building..'
      }
    }
    stage('build:image') {
      steps {
        writeFile file: '.env', text: 'ENV_EXAMPLE'
        sh 'docker build -t ms_node/devops .'
        echo 'Running docker build..'
      }
    }
    stage('Cleanup') {
      steps {
        echo 'Cleaning..'
        echo 'Running docker rmi..'
      }
    }
  }
}