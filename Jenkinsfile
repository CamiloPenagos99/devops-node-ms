void setBuildStatus(String message, String state) {
  step([
    $class: "GitHubCommitStatusSetter",
    reposSource: [$class: "ManuallyEnteredRepositorySource", url: "https://github.com/CamiloPenagos99/devops-node-ms"],
    contextSource: [$class: "ManuallyEnteredCommitContextSource", context: "ci/jenkins/build-status"],
    errorHandlers: [
      [$class: "ChangingBuildStatusErrorHandler", result: "UNSTABLE"]
    ],
    statusResultSource: [$class: "ConditionalStatusResultSource", results: [
      [$class: "AnyBuildResult", message: message, state: state]
    ]]
  ]);
}

pipeline {

  agent any

  triggers {
    githubPush()
  }

  environment {
    FULL_PATH_BRANCH = "${sh(script:'git name-rev --name-only HEAD', returnStdout: true)}"
    GIT_BRANCH = FULL_PATH_BRANCH.substring(FULL_PATH_BRANCH.lastIndexOf('/') + 1, FULL_PATH_BRANCH.length()).trim()
  }

  tools {
    nodejs "node-devops-config"
  }

  stages {
    stage('Init') {
      steps {
        echo "Running ${env.BUILD_ID} on ${env.JENKINS_URL}"
        script {
          buildName "Build: ${env.GIT_BRANCH}#${env.BUILD_ID}"
          buildDescription "Executed pipeline ${env.GIT_BRANCH}"
        }
        sh 'printenv | sort'
        //echo "rama actual: " + env.GIT_BRANCH

        //git credentialsId: 'token-github', branch: '**', url: 'https://github.com/CamiloPenagos99/devops-node-ms.git'
        script {
          // Checkout the repository and save the resulting metadata
          def scmVars = checkout([$class: 'GitSCM', branches: [
            [name: '*/*']
          ], extensions: [], userRemoteConfigs: [
            [credentialsId: 'token-github', url: 'https://github.com/CamiloPenagos99/devops-node-ms.git']
          ]])

          // Display the variable using scmVars
          //echo "scmVars.GIT_COMMIT"
          //echo "${scmVars.GIT_COMMIT}"

          // Displaying the variables saving it as environment variable
          env.GIT_COMMIT = scmVars.GIT_COMMIT
          env.GITHUB_BRANCH = scmVars.GIT_BRANCH
          //echo "env.GIT_COMMIT"
          //echo "${env.GIT_COMMIT}"
        }
        echo "info git " + env.GIT_COMMIT + env.GITHUB_BRANCH
        sh 'pwd'
        sh 'ls'

      }
      post {
        always {
          setBuildStatus("Build pending", "PENDING");
        }
      }
    }
    stage('stage-branch-stuff') {
      when {
        environment name: 'GIT_BRANCH', value: 'stage'
      }
      steps {
        echo 'run this stage - when branch is equal to stage'
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
        parallel(
          "unit-test": {
            sh script: 'npm run test',
            label: "unit-test"
            echo 'Testing..'
          }
        )

      }
    }
    stage('analysis') {
      environment {
        scannerHome = tool 'SonarQubeScanner'
      }

      steps {
        withSonarQubeEnv('sonarqube') {
          echo "SonarServer ${env.SONAR_HOST_URL}"
          sh "${scannerHome}/bin/sonar-scanner"
        }
        timeout(time: 3, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
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
  post {
    always {
      echo "post ! notify build status"
    }
    success {
      setBuildStatus("Build complete", "SUCCESS");
    }
    failure {
      setBuildStatus("Build failed", "FAILURE");
    }
  }
}